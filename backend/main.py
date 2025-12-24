from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, JSONResponse
import cv2
import time
from datetime import datetime
import base64
import io
from PIL import Image
import numpy as np

app = FastAPI(title="INTAI Backend API")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configuration
USE_WEBCAM = True  # Set to False to use a video file instead
VIDEO_FILE = 'sample_video.mp4'  # Only used if USE_WEBCAM is False
CAMERA_INDEX = 0  # 0 for default webcam, 1 for external camera, etc.

CAMERA_CONFIG = {
    'cameraId': 'R-39-F-003',
    'cameraName': 'CAM 41A',
    'location': 'Terminal 2 / Concourse F',
}

# Global variables for camera capture
# Use AVFoundation on macOS for USB cams
camera = cv2.VideoCapture(CAMERA_INDEX, cv2.CAP_AVFOUNDATION)

def get_camera():
    """Get or initialize camera capture"""
    global camera
    
    if camera is None or not camera.isOpened():
        if USE_WEBCAM:
            camera = cv2.VideoCapture(CAMERA_INDEX)
            # Set camera properties for better quality
            camera.set(cv2.CAP_PROP_FRAME_WIDTH, 1280)
            camera.set(cv2.CAP_PROP_FRAME_HEIGHT, 720)
            camera.set(cv2.CAP_PROP_FPS, 30)
        else:
            camera = cv2.VideoCapture(VIDEO_FILE)
    
    return camera

def generate_frames():
    """Generate video frames for streaming"""
    while True:
        cam = get_camera()
        
        if cam is None or not cam.isOpened():
            # Send a blank frame if camera is not available
            blank = np.zeros((480, 640, 3), dtype=np.uint8)
            ret, buffer = cv2.imencode('.jpg', blank)
            frame = buffer.tobytes()
            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')
            time.sleep(0.1)
            continue
        
        success, frame = cam.read()
        
        if not success:
            # If it's a video file, loop it
            if not USE_WEBCAM:
                cam.set(cv2.CAP_PROP_POS_FRAMES, 0)
            time.sleep(0.1)
            continue
        
        # Encode frame as JPEG
        ret, buffer = cv2.imencode('.jpg', frame, [cv2.IMWRITE_JPEG_QUALITY, 85])
        frame_bytes = buffer.tobytes()
        
        # Yield frame in multipart format
        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')
        
        # Control frame rate (30 fps = ~33ms per frame)
        time.sleep(0.033)

class CameraMetadataExtractor:
    def get_metadata(self):
        """Extract metadata from camera"""
        try:
            cam = get_camera()
            
            if cam is None or not cam.isOpened():
                return self._offline_metadata()
            
            # Extract video properties
            fps = int(cam.get(cv2.CAP_PROP_FPS))
            width = int(cam.get(cv2.CAP_PROP_FRAME_WIDTH))
            height = int(cam.get(cv2.CAP_PROP_FRAME_HEIGHT))
            
            # Get codec info
            fourcc = int(cam.get(cv2.CAP_PROP_FOURCC))
            codec = "".join([chr((fourcc >> 8 * i) & 0xFF) for i in range(4)])
            
            camera_type = "Webcam" if USE_WEBCAM else "Video File"
            
            return {
                'cameraId': CAMERA_CONFIG['cameraId'],
                'cameraName': CAMERA_CONFIG['cameraName'],
                'location': CAMERA_CONFIG['location'],
                'status': 'online',
                'latencyMs': 45 + int(time.time() % 30),  # Simulated latency
                'fps': fps if fps > 0 else 30,
                'resolution': f'{width}x{height}',
                'device': {
                    'model': camera_type,
                    'firmware': '1.0.0',
                    'ip': 'localhost' if USE_WEBCAM else '10.0.12.44',
                    'codec': codec.strip() if codec.strip() else 'MJPEG',
                    'lens': 'Built-in' if USE_WEBCAM else 'N/A',
                    'irMode': 'N/A',
                }
            }
        except Exception as e:
            print(f"Error getting metadata: {e}")
            return self._offline_metadata()
    
    def _offline_metadata(self):
        """Return offline metadata"""
        return {
            'cameraId': CAMERA_CONFIG['cameraId'],
            'cameraName': CAMERA_CONFIG['cameraName'],
            'location': CAMERA_CONFIG['location'],
            'status': 'offline',
            'latencyMs': 0,
            'fps': 0,
            'resolution': 'unknown',
            'device': {
                'model': 'Unknown',
                'firmware': 'Unknown',
                'ip': 'Unknown',
                'codec': 'unknown',
                'lens': 'N/A',
                'irMode': 'N/A',
            }
        }

def generate_placeholder_portrait():
    """Generate a simple placeholder portrait image"""
    # Create a simple silhouette-like image
    img = Image.new('RGB', (200, 200), color=(26, 31, 38))
    
    # Convert to base64
    buffer = io.BytesIO()
    img.save(buffer, format='PNG')
    buffer.seek(0)
    img_base64 = base64.b64encode(buffer.getvalue()).decode()
    
    return f"data:image/png;base64,{img_base64}"

def generate_detections():
    """Generate some mock detections that move slightly"""
    t = time.time()
    
    # Moving detection in live feed
    live_x = 0.42 + 0.05 * (t % 3 - 1.5)
    live_y = 0.18 + 0.03 * (t % 2 - 1)
    
    # Moving detection in manipulated feed (slightly different)
    manip_x = 0.38 + 0.04 * (t % 2.5 - 1.25)
    manip_y = 0.20 + 0.02 * (t % 3 - 1.5)
    
    return [
        {
            'id': 'd-live-1',
            'feed': 'live',
            'bbox': {
                'x': max(0.1, min(0.8, live_x)),
                'y': max(0.1, min(0.7, live_y)),
                'w': 0.10,
                'h': 0.22,
            },
            'confidence': 0.75 + 0.08 * ((t % 5) / 5),
            'isTarget': True,
        },
        {
            'id': 'd-manip-1',
            'feed': 'manipulated',
            'bbox': {
                'x': max(0.1, min(0.8, manip_x)),
                'y': max(0.1, min(0.7, manip_y)),
                'w': 0.11,
                'h': 0.23,
            },
            'confidence': 0.72 + 0.06 * ((t % 4) / 4),
            'isTarget': True,
        },
        {
            'id': 'd-live-2',
            'feed': 'live',
            'bbox': {
                'x': 0.15,
                'y': 0.45,
                'w': 0.08,
                'h': 0.18,
            },
            'confidence': 0.65,
            'isTarget': False,
        },
        {
            'id': 'd-manip-2',
            'feed': 'manipulated',
            'bbox': {
                'x': 0.70,
                'y': 0.35,
                'w': 0.09,
                'h': 0.20,
            },
            'confidence': 0.58,
            'isTarget': False,
        },
    ]

@app.get("/api/dashboard")
async def get_dashboard(mode: str = None):
    """Main dashboard endpoint"""
    
    # Extract camera metadata
    extractor = CameraMetadataExtractor()
    camera_meta = extractor.get_metadata()
    
    # Check if demo mode via query parameter
    is_demo = mode == 'demo'
    
    # Build response
    response = {
        'timestamp': datetime.now().isoformat(),
        'feeds': {
            'live': {
                'type': 'mp4',
                # Use relative URLs for demo videos (served by frontend)
                'url': '/phase4_original.mp4' if is_demo else f'http://localhost:8080/api/video/live',
            },
            'manipulated': {
                'type': 'mp4',
                # Use relative URLs for demo videos (served by frontend)
                'url': '/phase4_removed.mp4' if is_demo else f'http://localhost:8080/api/video/manipulated',
            }
        },
        'target': {
            'portraitUrl': '/VIP1.jpg',
            'confidence': 0.20 + 0.15 * ((time.time() % 10) / 10),
            'label': 'VIP1',
        },
        'cameraMeta': camera_meta,
        'detections': generate_detections(),
    }
    
    return JSONResponse(content=response)

@app.get("/api/video/{feed_type}")
async def stream_video(feed_type: str):
    """Stream video from webcam or file (MJPEG stream)"""
    
    return StreamingResponse(
        generate_frames(),
        media_type='multipart/x-mixed-replace; boundary=frame'
    )

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "ok", "timestamp": datetime.now().isoformat()}

@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown"""
    global camera
    if camera is not None:
        camera.release()
        print("\n📹 Camera released")

if __name__ == "__main__":
    import uvicorn
    
    print("=" * 60)
    print("INTAI Backend Server (FastAPI + Uvicorn)")
    print("=" * 60)
    
    if USE_WEBCAM:
        print(f"📹 Mode: WEBCAM (Camera Index: {CAMERA_INDEX})")
        print(f"   Attempting to use camera at index {CAMERA_INDEX}")
        print(f"   Change CAMERA_INDEX in main.py if you have multiple cameras")
        
        # Test camera access
        test_cam = cv2.VideoCapture(CAMERA_INDEX)
        if test_cam.isOpened():
            print("   ✅ Camera detected and accessible")
            test_cam.release()
        else:
            print("   ⚠️  WARNING: Cannot access camera!")
            print("   - Check if another application is using the camera")
            print("   - Try a different CAMERA_INDEX (0, 1, 2, etc.)")
            print("   - Or set USE_WEBCAM = False to use a video file")
    else:
        print(f"📁 Mode: VIDEO FILE")
        import os
        if os.path.exists(VIDEO_FILE):
            print(f"   ✅ Video file found: {VIDEO_FILE}")
        else:
            print(f"   ⚠️  WARNING: Video file '{VIDEO_FILE}' not found!")
            print("   Run: ./download_sample_video.sh")
            print("   Or place your own video as 'sample_video.mp4'")
    
    print()
    print("🌐 Server starting...")
    print(f"   API: http://localhost:8080/api/dashboard")
    print(f"   Video: http://localhost:8080/api/video/live")
    print(f"   Health: http://localhost:8080/health")
    print(f"   Docs: http://localhost:8080/docs")
    print()
    print("Press Ctrl+C to stop")
    print("=" * 60)
    
    uvicorn.run(app, host="0.0.0.0", port=8080, log_level="info")

