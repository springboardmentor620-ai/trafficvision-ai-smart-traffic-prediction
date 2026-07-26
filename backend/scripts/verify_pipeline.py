import sys
import os
import cv2
import time
from datetime import datetime

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database.session import SessionLocal
from app.models.models import Road, UploadedVideo, TrafficData
from app.repositories.traffic_repository import TrafficRepository
from app.services.ai_processor import AIProcessor
from app.config.settings import settings, BASE_DIR

def verify():
    print("=" * 70)
    print("AI PIPELINE COMPLETE VERIFICATION")
    print("=" * 70)
    
    db = SessionLocal()
    try:
        road = db.query(Road).filter(Road.road_name.ilike('%5th Avenue%')).first()
        print(f"\n[ROAD INFORMATION]")
        if road:
            print(f"  • Road ID:        {road.id}")
            print(f"  • Road Name:      {road.road_name}")
            print(f"  • Road Code:      {road.road_code}")
            print(f"  • Zone:           {road.zone}")
            print(f"  • Lanes:          {road.lanes}")
            print(f"  • Length (km):    {road.length_km}")
        else:
            print("  • Road NOT found!")
            return

        print(f"\n[VIDEO FILE INFORMATION]")
        video_input_path = os.path.join(BASE_DIR, "uploads", "videos", "Traffic Video 1.mp4")
        video_output_path = os.path.join(BASE_DIR, "uploads", "processed", "processed_Traffic Video 1.mp4")
        
        print(f"  • Input Video Path:  {video_input_path} (Exists: {os.path.exists(video_input_path)})")
        print(f"  • Output Video Path: {video_output_path} (Exists: {os.path.exists(video_output_path)})")
        
        if os.path.exists(video_output_path):
            size_mb = os.path.getsize(video_output_path) / (1024 * 1024)
            print(f"  • Processed Video Size: {size_mb:.2f} MB")

        cap = cv2.VideoCapture(video_input_path)
        if cap.isOpened():
            fps = cap.get(cv2.CAP_PROP_FPS)
            total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
            w = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
            h = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
            duration = total_frames / fps if fps > 0 else 0
            cap.release()
            print(f"  • Input Video Properties:")
            print(f"    - Opened successfully: True")
            print(f"    - Total Frames: {total_frames}")
            print(f"    - FPS: {fps:.2f}")
            print(f"    - Resolution: {w}x{h}")
            print(f"    - Duration: {duration:.2f}s")
        else:
            print(f"  • Failed to open input video!")

        print(f"\n[UPLOADED VIDEO DB RECORD]")
        videos = db.query(UploadedVideo).filter(UploadedVideo.road_id == road.id).all()
        for v in videos:
            print(f"  • Video ID: {v.id} | Filename: {v.filename} | Status: {v.status}")
            print(f"    Total Frames: {v.total_frames} | FPS: {v.fps} | Duration: {v.duration_seconds}s | Res: {v.resolution}")
            print(f"    Counts -> Cars: {v.car_count}, Buses: {v.bus_count}, Trucks: {v.truck_count}, Motos: {v.motorcycle_count}")

        print(f"\n[TRAFFIC DATA DB RECORD (SUPABASE / SQLITE)]")
        traffic_records = db.query(TrafficData).filter(TrafficData.road_id == road.id).order_by(TrafficData.processed_at.desc()).all()
        for t in traffic_records:
            print(f"  • Record ID: {t.id}")
            print(f"    road_id: {t.road_id}")
            print(f"    road_name: {road.road_name}")
            print(f"    vehicle_count: {t.vehicle_count}")
            print(f"    car_count: {t.car_count}")
            print(f"    bus_count: {t.bus_count}")
            print(f"    truck_count: {t.truck_count}")
            print(f"    motorcycle_count: {t.motorcycle_count}")
            print(f"    average_speed: {t.average_speed} km/h")
            print(f"    congestion_level: {t.congestion_level}")
            print(f"    confidence: {t.confidence}")
            print(f"    processed_at: {t.processed_at}")
            print(f"    video_name: {t.video_name}")

        print(f"\n[LIVE MONITORING DASHBOARD INTEGRATION]")
        lm = TrafficRepository.get_live_monitoring(db)
        items = lm.get('items', [])
        print(f"  • Total Roads Returned: {len(items)}")
        for item in items:
            ai_flag = item.get('ai_status', 'SEEDED')
            print(f"    - [{ai_flag}] {item['road_name']} (ID: {item['road_id']}): Veh={item['vehicle_count']}, Congestion={item['congestion_level']}, Conf={item.get('confidence', 'N/A')}, Processed={item.get('processed_at', 'N/A')}")

        print(f"\n[BENCHMARK / PERFORMANCE SAMPLE]")
        ai_proc = AIProcessor()
        # Test sample frame inference time
        cap = cv2.VideoCapture(video_input_path)
        ret, sample_frame = cap.read()
        cap.release()
        
        if ret:
            times = []
            for _ in range(5):
                t0 = time.perf_counter()
                _ = ai_proc.process_frame(sample_frame.copy(), 0, lanes=road.lanes, length_km=road.length_km)
                t1 = time.perf_counter()
                times.append((t1 - t0) * 1000)
            avg_inf_ms = sum(times) / len(times)
            avg_fps = 1000.0 / avg_inf_ms if avg_inf_ms > 0 else 0
            print(f"  • Sample Frame Inference Time: {avg_inf_ms:.2f} ms ({avg_fps:.2f} FPS)")

    finally:
        db.close()

if __name__ == "__main__":
    verify()
