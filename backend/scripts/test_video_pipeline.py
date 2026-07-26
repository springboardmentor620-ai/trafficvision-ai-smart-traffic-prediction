import sys
import os
import time
import cv2
import numpy as np

# Ensure backend directory is in the path
backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from fastapi.testclient import TestClient
from app.main import app
from app.database.session import SessionLocal, init_db
from app.models.models import User, Road, UploadedVideo
from app.utils.security import create_access_token
from app.config.settings import settings

def create_mock_video(filepath: str, num_frames: int = 45, fps: int = 15, width: int = 320, height: int = 240):
    """Generate a valid mock MP4 video file using OpenCV."""
    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
    out = cv2.VideoWriter(filepath, fourcc, fps, (width, height))
    for i in range(num_frames):
        # Create a basic image frame (gradient background with animated text)
        frame = np.zeros((height, width, 3), dtype=np.uint8)
        frame[:, :, 0] = i * 4 % 255  # Blue channel gradient
        frame[:, :, 1] = i * 8 % 255  # Green channel gradient
        cv2.putText(
            frame, 
            f"Test Frame {i}", 
            (30, height // 2), 
            cv2.FONT_HERSHEY_SIMPLEX, 
            0.8, 
            (255, 255, 255), 
            2
        )
        out.write(frame)
    out.release()
    print(f"Mock video generated at: {filepath} ({num_frames} frames, {width}x{height}, {fps} FPS)")

def test_video_pipeline():
    # Make sure DB schema is up-to-date
    init_db()

    client = TestClient(app)
    db = SessionLocal()
    
    mock_filepath = os.path.join(backend_dir, "test_mock_video.mp4")
    invalid_filepath = os.path.join(backend_dir, "test_invalid_video.mp4")
    txt_filepath = os.path.join(backend_dir, "test_text_file.txt")

    try:
        print("\n" + "=" * 60)
        print("=== RUNNING VIDEO PROCESSING PIPELINE E2E TEST ===")
        print("=" * 60 + "\n")

        # 1. Authenticate as Admin
        admin_user = db.query(User).filter(User.role.ilike("admin")).first()
        if not admin_user:
            # Seed a default admin if none found to ensure robustness
            admin_user = User(
                name="System Administrator",
                email="admin_system@trafficvision.ai",
                password_hash="fakehash",
                role="Admin",
                status="ACTIVE"
            )
            db.add(admin_user)
            db.commit()
            db.refresh(admin_user)

        token = create_access_token({
            "sub": str(admin_user.id),
            "email": admin_user.email,
            "role": admin_user.role,
            "name": admin_user.name
        })
        headers = {"Authorization": f"Bearer {token}"}

        # Find or create a road corridor to test mapping
        road = db.query(Road).first()
        if not road:
            road = Road(
                road_name="Test Verification Avenue",
                road_code="RD-TEST",
                zone="Test Zone",
                latitude=12.9,
                longitude=77.5,
                status="Active"
            )
            db.add(road)
            db.commit()
            db.refresh(road)

        road_id = road.id

        # Generate files
        create_mock_video(mock_filepath, num_frames=30, fps=15, width=320, height=240)
        
        # Create an empty invalid video file
        with open(invalid_filepath, "wb") as f:
            f.write(b"NOT A REAL VIDEO FILE CONTENTS")

        # Create a text file
        with open(txt_filepath, "w") as f:
            f.write("This is a simple text file, not a video.")

        # --- TEST 1: Reject Invalid Extension (.txt) ---
        print("\nTEST 1: Uploading text file (expecting 400)...")
        with open(txt_filepath, "rb") as f:
            response = client.post(
                "/api/v1/videos/upload",
                headers=headers,
                files={"file": ("test_text_file.txt", f, "text/plain")},
                data={"road_id": road_id}
            )
        print(f"Status code: {response.status_code}")
        assert response.status_code == 400
        assert "Invalid file format" in response.json()["detail"]
        print("[SUCCESS] Invalid extension rejected correctly.")

        # --- TEST 2: Reject Corrupted/Invalid Video ---
        print("\nTEST 2: Uploading corrupted file (expecting 400)...")
        with open(invalid_filepath, "rb") as f:
            response = client.post(
                "/api/v1/videos/upload",
                headers=headers,
                files={"file": ("test_invalid_video.mp4", f, "video/mp4")},
                data={"road_id": road_id}
            )
        print(f"Status code: {response.status_code}")
        assert response.status_code == 400
        assert "Video validation failed" in response.json()["detail"]
        
        # Verify physical file was not left on disk
        uploaded_invalid_path = os.path.join(settings.UPLOAD_FOLDER, "test_invalid_video.mp4")
        assert not os.path.exists(uploaded_invalid_path), "Corrupted video file was not cleaned up from disk!"
        print("[SUCCESS] Corrupted video rejected and cleaned up correctly.")

        # --- TEST 3: Reject File Exceeding Size limit ---
        print("\nTEST 3: Uploading size-exceeded file (expecting 413)...")
        # Temporarily mock a tiny max size (100 bytes)
        original_max_size = settings.MAX_UPLOAD_SIZE
        settings.MAX_UPLOAD_SIZE = 100
        try:
            with open(mock_filepath, "rb") as f:
                response = client.post(
                    "/api/v1/videos/upload",
                    headers=headers,
                    files={"file": ("test_mock_video.mp4", f, "video/mp4")},
                    data={"road_id": road_id}
                )
            print(f"Status code: {response.status_code}")
            assert response.status_code == 413
            assert "exceeds maximum upload size" in response.json()["detail"]
            
            uploaded_oversized_path = os.path.join(settings.UPLOAD_FOLDER, "test_mock_video.mp4")
            assert not os.path.exists(uploaded_oversized_path), "Oversized video file was not cleaned up from disk!"
            print("[SUCCESS] Oversized video rejected and cleaned up correctly.")
        finally:
            settings.MAX_UPLOAD_SIZE = original_max_size

        # --- TEST 4: Successful Upload & Traversal ---
        print("\nTEST 4: Uploading valid mock video (expecting 201)...")
        with open(mock_filepath, "rb") as f:
            response = client.post(
                "/api/v1/videos/upload",
                headers=headers,
                files={"file": ("test_mock_video.mp4", f, "video/mp4")},
                data={"road_id": road_id}
            )
        print(f"Status code: {response.status_code}")
        assert response.status_code == 201
        
        res_data = response.json()
        print(f"Server response payload:\n  {res_data}")
        
        video_id = res_data["id"]
        assert res_data["filename"] == "test_mock_video.mp4"
        assert res_data["total_frames"] == 30
        assert res_data["fps"] == 15.0
        assert res_data["duration_seconds"] == 2.0
        assert res_data["resolution"] == "320x240"
        assert res_data["road_id"] == road_id
        assert res_data["status"] == "Uploaded"
        
        # Verify file is stored on disk
        saved_filepath = res_data["filepath"]
        assert os.path.exists(saved_filepath), "Saved video file does not exist on disk!"
        print("[SUCCESS] Valid video uploaded, processed, and saved successfully.")

        # --- TEST 5: Get Uploaded Videos ---
        print("\nTEST 5: Getting uploaded videos (expecting 200)...")
        response = client.get("/api/v1/videos", headers=headers)
        print(f"Status code: {response.status_code}")
        assert response.status_code == 200
        videos_list = response.json()
        assert len(videos_list) > 0
        assert any(v["id"] == video_id for v in videos_list)
        print("[SUCCESS] Uploaded videos list retrieved correctly.")

        # --- TEST 6: Delete Video ---
        print("\nTEST 6: Deleting video (expecting 200)...")
        response = client.delete(f"/api/v1/videos/{video_id}", headers=headers)
        print(f"Status code: {response.status_code}")
        assert response.status_code == 200
        assert "deleted successfully" in response.json()["message"]

        # Confirm DB entry is deleted
        db_video = db.query(UploadedVideo).filter(UploadedVideo.id == video_id).first()
        assert db_video is None, "Video metadata was not removed from DB!"

        # Confirm file is deleted from disk
        assert not os.path.exists(saved_filepath), "Physical video file was not deleted from disk!"
        print("[SUCCESS] Video metadata and physical file deleted successfully.")

        print("\n" + "=" * 60)
        print("[SUCCESS] ALL VIDEO PROCESSING PIPELINE TESTS PASSED!")
        print("=" * 60 + "\n")

    finally:
        # Cleanup temp generated files on workspace root
        for filepath in [mock_filepath, invalid_filepath, txt_filepath]:
            if os.path.exists(filepath):
                try:
                    os.remove(filepath)
                except Exception:
                    pass
        db.close()

if __name__ == "__main__":
    test_video_pipeline()
