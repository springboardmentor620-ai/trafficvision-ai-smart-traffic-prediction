import logging
import os
import time
from typing import Dict, Any, Optional
import numpy as np
import cv2
from ultralytics import YOLO
from app.config.settings import settings

logger = logging.getLogger("trafficvision.ai")

# Map COCO class IDs to target vehicle types
VEHICLE_CLASS_MAP = {
    2: "car",
    3: "motorcycle",
    5: "bus",
    7: "truck"
}

# Rich neon color palette (B, G, R) for drawing target vehicle types
VEHICLE_COLOR_MAP = {
    "car": (46, 204, 113),         # Neon Green
    "motorcycle": (241, 196, 15),  # Neon Yellow
    "bus": (52, 152, 219),         # Neon Blue
    "truck": (155, 89, 182)        # Neon Purple
}

class AIProcessor:
    def __init__(self, model_path: Optional[str] = None):
        self.model_path = model_path or settings.YOLO_MODEL_PATH
        self.model = None
        self._initialize_model()

    def _initialize_model(self):
        """
        Loads the YOLOv8 model from the settings path.
        """
        logger.info("Initializing AI Processor with model path: %s", self.model_path)
        try:
            # Create models directory if it doesn't exist
            model_dir = os.path.dirname(self.model_path)
            if model_dir:
                os.makedirs(model_dir, exist_ok=True)
            
            # Load YOLO model
            self.model = YOLO(self.model_path)
            logger.info("YOLOv8 Model loaded successfully.")
        except Exception as e:
            logger.critical("Failed to load YOLOv8 model: %s", str(e))
            raise RuntimeError(f"YOLOv8 initialization error: {str(e)}")

    def process_frame(
        self, 
        frame: np.ndarray, 
        frame_id: int, 
        lanes: int = 4, 
        length_km: float = 2.5
    ) -> Dict[str, Any]:
        """
        Detects vehicles in a frame, draws bounding boxes, calculates congestion score/level,
        and renders a modern telemetry HUD overlay.
        """
        t_start = time.perf_counter()
        
        # Guard against invalid frames
        if frame is None:
            return {
                "frame_id": frame_id,
                "detected_vehicles": 0,
                "counts": {"car": 0, "bus": 0, "truck": 0, "motorcycle": 0},
                "congestion_score": 0.0,
                "congestion_level": "Low",
                "confidences": [],
                "inference_time_ms": 0.0
            }

        # 1. Run YOLO inference with optimization: CPU, class filtering, confidence threshold
        counts = {"car": 0, "bus": 0, "truck": 0, "motorcycle": 0}
        confidences = []
        
        try:
            # Predict only target vehicle class IDs [2, 3, 5, 7]
            results = self.model.predict(
                source=frame,
                classes=list(VEHICLE_CLASS_MAP.keys()),
                conf=0.25,
                device="cpu",
                verbose=False
            )
            
            # 2. Extract and draw bounding boxes
            if results and len(results) > 0:
                boxes = results[0].boxes
                for box in boxes:
                    cls_id = int(box.cls[0].item())
                    conf = float(box.conf[0].item())
                    confidences.append(conf)
                    
                    class_name = VEHICLE_CLASS_MAP.get(cls_id, "unknown")
                    if class_name in counts:
                        counts[class_name] += 1
                    
                    # Coordinates
                    x1, y1, x2, y2 = map(int, box.xyxy[0].tolist())
                    color = VEHICLE_COLOR_MAP.get(class_name, (255, 255, 255))
                    
                    # Draw elegant bounding box
                    cv2.rectangle(frame, (x1, y1), (x2, y2), color, 2, cv2.LINE_AA)
                    
                    # Draw label tag above the bounding box
                    label = f"{class_name} {conf:.2f}"
                    (w, h), _ = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, 0.4, 1)
                    y_label_start = max(y1, h + 10)
                    cv2.rectangle(frame, (x1, y_label_start - h - 6), (x1 + w + 10, y_label_start), color, -1)
                    cv2.putText(frame, label, (x1 + 5, y_label_start - 3), cv2.FONT_HERSHEY_SIMPLEX, 0.4, (255, 255, 255), 1, cv2.LINE_AA)
                    
        except Exception as pred_err:
            logger.error("Inference failed for frame ID %d: %s", frame_id, str(pred_err))

        total_vehicles = sum(counts.values())

        # 3. Calculate Congestion Metrics
        view_length = settings.VIEW_LENGTH_KM
        lane_capacity = settings.LANE_CAPACITY_PER_KM
        capacity = lanes * view_length * lane_capacity
        
        # Vehicle density (vehicles per lane-km)
        density = total_vehicles / (lanes * view_length) if (lanes > 0 and view_length > 0) else 0.0
        
        # Traffic load (%)
        load = (total_vehicles / capacity) * 100.0 if capacity > 0 else 0.0
        load = min(100.0, load)
        congestion_score = load

        # Map score to Congestion Level thresholds
        if congestion_score < settings.CONGESTION_THRESHOLD_LOW:
            congestion_level = "Low"
            level_color = (46, 204, 113) # Green
        elif congestion_score < settings.CONGESTION_THRESHOLD_MODERATE:
            congestion_level = "Moderate"
            level_color = (241, 196, 15) # Yellow
        elif congestion_score < settings.CONGESTION_THRESHOLD_HIGH:
            congestion_level = "High"
            level_color = (230, 126, 34) # Orange
        else:
            congestion_level = "Severe"
            level_color = (231, 76, 60) # Red

        # 4. Render a premium glassmorphic HUD panel (top-left)
        try:
            overlay = frame.copy()
            # Dimensions of the dashboard card
            card_x1, card_y1 = 15, 15
            card_x2, card_y2 = 330, 200
            cv2.rectangle(overlay, (card_x1, card_y1), (card_x2, card_y2), (20, 24, 33), -1) # Dark card fill
            cv2.rectangle(overlay, (card_x1, card_y1), (card_x2, card_y2), (58, 63, 76), 1)  # Thin boundary border
            
            # Alpha blend overlay for semi-transparency
            alpha = 0.75
            cv2.addWeighted(overlay, alpha, frame, 1.0 - alpha, 0, frame)
            
            # HUD text lines
            # Dashboard title
            cv2.putText(frame, "TRAFFICVISION AI | MONITORING", (card_x1 + 10, card_y1 + 20), cv2.FONT_HERSHEY_SIMPLEX, 0.45, (52, 152, 219), 2, cv2.LINE_AA)
            cv2.line(frame, (card_x1 + 10, card_y1 + 28), (card_x2 - 10, card_y1 + 28), (58, 63, 76), 1, cv2.LINE_AA)
            
            # Line 1: Frame ID & Total counts
            cv2.putText(frame, f"Frame ID: {frame_id:04d}", (card_x1 + 10, card_y1 + 45), cv2.FONT_HERSHEY_SIMPLEX, 0.4, (189, 195, 199), 1, cv2.LINE_AA)
            cv2.putText(frame, f"Total Vehicles: {total_vehicles}", (card_x1 + 10, card_y1 + 65), cv2.FONT_HERSHEY_SIMPLEX, 0.45, (255, 255, 255), 1, cv2.LINE_AA)
            
            # Line 2: Breakdown counts
            breakdown_1 = f"Cars: {counts['car']} | Buses: {counts['bus']}"
            breakdown_2 = f"Trucks: {counts['truck']} | Motos: {counts['motorcycle']}"
            cv2.putText(frame, breakdown_1, (card_x1 + 10, card_y1 + 85), cv2.FONT_HERSHEY_SIMPLEX, 0.38, (189, 195, 199), 1, cv2.LINE_AA)
            cv2.putText(frame, breakdown_2, (card_x1 + 10, card_y1 + 100), cv2.FONT_HERSHEY_SIMPLEX, 0.38, (189, 195, 199), 1, cv2.LINE_AA)
            cv2.line(frame, (card_x1 + 10, card_y1 + 108), (card_x2 - 10, card_y1 + 108), (58, 63, 76), 1, cv2.LINE_AA)
            
            # Line 3: Congestion metrics
            cv2.putText(frame, f"Density: {density:.1f} veh/lane-km", (card_x1 + 10, card_y1 + 125), cv2.FONT_HERSHEY_SIMPLEX, 0.4, (189, 195, 199), 1, cv2.LINE_AA)
            cv2.putText(frame, f"Traffic Load: {congestion_score:.1f}%", (card_x1 + 10, card_y1 + 145), cv2.FONT_HERSHEY_SIMPLEX, 0.4, (189, 195, 199), 1, cv2.LINE_AA)
            
            # Line 4: Congestion level banner
            cv2.putText(frame, "Level: ", (card_x1 + 10, card_y1 + 170), cv2.FONT_HERSHEY_SIMPLEX, 0.45, (255, 255, 255), 1, cv2.LINE_AA)
            cv2.putText(frame, congestion_level.upper(), (card_x1 + 60, card_y1 + 170), cv2.FONT_HERSHEY_SIMPLEX, 0.5, level_color, 2, cv2.LINE_AA)
        except Exception as hud_err:
            logger.warning("Failed to render HUD overlay: %s", str(hud_err))

        exec_time_ms = (time.perf_counter() - t_start) * 1000

        return {
            "frame_id": frame_id,
            "detected_vehicles": total_vehicles,
            "counts": counts,
            "congestion_score": round(congestion_score, 2),
            "congestion_level": congestion_level,
            "confidences": confidences,
            "inference_time_ms": round(exec_time_ms, 2)
        }
