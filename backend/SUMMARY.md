# Backend Summary

## What Was Changed

The backend now supports **live webcam streaming** instead of just static video files.

### Key Changes

1. **Webcam Support**: Uses OpenCV to capture live camera feed
2. **MJPEG Streaming**: Streams video frames in real-time via HTTP
3. **Real Metadata**: Extracts actual camera properties (fps, resolution, codec)
4. **Dynamic Bounding Boxes**: Generates moving detection boxes for testing
5. **Dual Mode**: Can switch between webcam and video file

### Configuration

In `backend/app.py`:

```python
USE_WEBCAM = True   # Use live webcam (default)
USE_WEBCAM = False  # Use video file

CAMERA_INDEX = 0    # Which camera to use (0 = default)
```

## How to Use

### With Webcam (Default)

```bash
cd backend
pip install -r requirements.txt
python app.py
```

### With Video File

```bash
cd backend
pip install -r requirements.txt

# Edit app.py: set USE_WEBCAM = False
./download_sample_video.sh
python app.py
```

## Frontend Changes

The `VideoPlayer` component now automatically detects and handles:
- **MJPEG streams** (from webcam) → uses `<img>` tag
- **MP4 files** (from URL) → uses `<video>` tag

No configuration needed - it just works!

## API Endpoints

All endpoints remain the same:
- `GET /api/dashboard` - Dashboard data (includes camera metadata)
- `GET /api/video/live` - Live feed (MJPEG stream from webcam)
- `GET /api/video/manipulated` - Manipulated feed (same as live for testing)
- `GET /health` - Health check

## What You Get

✅ Live webcam feed in the dashboard
✅ Real camera metadata (resolution, fps, codec)
✅ Moving bounding boxes (simulated detection)
✅ Both feeds working (showing same camera for now)
✅ Target panel with confidence scores
✅ All UI features working (toggles, overlays, etc.)

## Next Steps

To add real detection:
1. Integrate a face detection model (Haar Cascades, YOLO, etc.)
2. Process frames in `generate_frames()` before encoding
3. Return actual detection coordinates
4. Optionally draw boxes on the "manipulated" feed server-side

The infrastructure is ready - just add your detection logic!


