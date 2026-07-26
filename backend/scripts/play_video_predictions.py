import cv2
import os

video_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "uploads", "processed", "processed_Traffic Video 1.mp4"))

if not os.path.exists(video_path):
    print(f"Error: Processed video file not found at: {video_path}")
    exit(1)

print("=" * 60)
print(" PLAYING ANNOTATED TRAFFIC AI VIDEO PREDICTIONS")
print(" Controls: Press 'q' to Exit | Press SPACE to Pause / Unpause")
print("=" * 60)

cap = cv2.VideoCapture(video_path)
fps = cap.get(cv2.CAP_PROP_FPS) or 30.0
delay = int(1000 / fps)

paused = False

while cap.isOpened():
    if not paused:
        ret, frame = cap.read()
        if not ret:
            print("End of video stream. Restarting playback...")
            cap.set(cv2.CAP_PROP_POS_FRAMES, 0)
            continue
        cv2.imshow("TrafficVision AI - 5th Avenue Predictions HUD", frame)

    key = cv2.waitKey(delay) & 0xFF
    if key == ord('q'):
        break
    elif key == ord(' '):
        paused = not paused

cap.release()
cv2.destroyAllWindows()
