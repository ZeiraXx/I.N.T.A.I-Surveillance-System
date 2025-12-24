# Backend API for INTAI Dashboard

A Python backend for testing the INTAI surveillance dashboard with live webcam support.

**Two versions available:**
- `app.py` - Flask backend
- `main.py` - FastAPI + Uvicorn backend (recommended for performance)

## Features

- ✅ **Live webcam streaming** (MJPEG)
- ✅ Video file streaming (MP4) - as fallback
- ✅ Camera metadata extraction (real-time from webcam or video)
- ✅ Dynamic detection data (moving bounding boxes)
- ✅ Target subject data
- ✅ CORS enabled for frontend access

## Setup

### 1. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

Or with a virtual environment:

```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Choose Video Source

The backend supports two modes:

#### Option A: Use Your Webcam (Default)
The backend is configured to use your webcam by default. Just run it!

**FastAPI + Uvicorn (recommended):**
```bash
python main.py
# or
uvicorn main:app --host 0.0.0.0 --port 8080 --reload
```

**Flask:**
```bash
python app.py
```

If you have multiple cameras, edit the config in either file:
```python
CAMERA_INDEX = 0  # Change to 1, 2, etc. for other cameras
```

#### Option B: Use a Video File
Edit `app.py`:
```python
USE_WEBCAM = False  # Change from True to False
```

Then download a test video:
```bash
./download_sample_video.sh
# Or manually:
curl -o sample_video.mp4 https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4
```

### 3. Run the Server

```bash
python app.py
```

The server will start at `http://localhost:8080`

You should see:
- ✅ Camera detected (if using webcam)
- 🌐 Server URLs

## API Endpoints

### GET /api/dashboard
Main endpoint that returns dashboard state including:
- Video feed URLs
- Camera metadata (extracted from video)
- Target information
- Detections (with moving bounding boxes)

**Response format:**
```json
{
  "timestamp": "2025-12-23T10:20:30.000Z",
  "feeds": {
    "live": {
      "type": "mp4",
      "url": "http://localhost:8080/api/video/live"
    },
    "manipulated": {
      "type": "mp4",
      "url": "http://localhost:8080/api/video/manipulated"
    }
  },
  "target": {
    "portraitUrl": "data:image/png;base64,...",
    "confidence": 0.25,
    "label": "UNKNOWN SUBJECT"
  },
  "cameraMeta": {
    "cameraId": "R-39-F-003",
    "cameraName": "CAM 41A",
    "location": "Terminal 2 / Concourse F",
    "status": "online",
    "latencyMs": 92,
    "fps": 30,
    "resolution": "1920x1080",
    "device": {...}
  },
  "detections": [...]
}
```

### GET /api/video/<feed_type>
Serves the video file.
- `/api/video/live` - Live feed
- `/api/video/manipulated` - Manipulated feed

(Both use the same video for testing)

### GET /health
Health check endpoint.

## Connect Frontend to Backend

Update your frontend `.env` file:

```env
VITE_DATA_MODE=api
VITE_API_BASE_URL=http://localhost:8080
VITE_DASHBOARD_PATH=/api/dashboard
```

Restart your frontend dev server:
```bash
npm run dev
```

## How It Works

1. **Video Streaming**: 
   - **Webcam mode**: Captures frames from your camera and streams as MJPEG
   - **File mode**: Serves the `sample_video.mp4` file via HTTP
2. **Metadata Extraction**: Uses OpenCV to read real camera/video properties (fps, resolution, codec)
3. **Dynamic Data**: Generates moving bounding boxes and fluctuating confidence scores
4. **CORS**: Enabled for frontend access from different ports

## Customization

### Switch Between Webcam and Video File
In `app.py`:
```python
USE_WEBCAM = True   # Use your webcam
USE_WEBCAM = False  # Use video file instead
```

### Select Different Camera
If you have multiple webcams:
```python
CAMERA_INDEX = 0  # Default camera
CAMERA_INDEX = 1  # External camera
# etc.
```

### Change Camera Info
Edit `CAMERA_CONFIG` in `app.py`:
```python
CAMERA_CONFIG = {
    'cameraId': 'YOUR-ID',
    'cameraName': 'YOUR-NAME',
    'location': 'YOUR-LOCATION',
}
```

### Use Different Video File
Replace `sample_video.mp4` with your video, or change `VIDEO_FILE` variable:
```python
VIDEO_FILE = 'your_video.mp4'
```

### Change Port
In `app.py`, modify:
```python
app.run(host='0.0.0.0', port=8080, debug=True)  # Change 8080 to your port
```

### Adjust Video Quality/Frame Rate
In the `get_camera()` function:
```python
camera.set(cv2.CAP_PROP_FRAME_WIDTH, 1280)   # Width
camera.set(cv2.CAP_PROP_FRAME_HEIGHT, 720)   # Height
camera.set(cv2.CAP_PROP_FPS, 30)             # Frame rate
```

And in `generate_frames()`:
```python
cv2.imencode('.jpg', frame, [cv2.IMWRITE_JPEG_QUALITY, 85])  # Quality (0-100)
time.sleep(0.033)  # Frame rate control (0.033 ≈ 30fps)
```

## Testing

Test the API:
```bash
# Check health
curl http://localhost:8080/health

# Get dashboard data
curl http://localhost:8080/api/dashboard

# Access video
curl http://localhost:8080/api/video/live --output test.mp4
```

## Notes

- Both "live" and "manipulated" feeds show the same camera/video for testing
- Bounding boxes are generated dynamically and move over time
- Confidence scores fluctuate to simulate real detection
- Camera metadata is extracted from the actual camera or video file
- MJPEG streaming is used for webcam (works in all browsers, no special codecs needed)

## Production Considerations

For a production backend, you would:
1. Use real RTSP streams instead of static MP4 files
2. Integrate actual detection/tracking algorithms
3. Add authentication/authorization
4. Use a proper WSGI server (gunicorn, uwsgi)
5. Add logging and monitoring
6. Handle multiple cameras
7. Implement proper error handling and retries

## Troubleshooting

**Camera not detected:**
- Check if another application is using the camera (close Zoom, Skype, etc.)
- Try a different `CAMERA_INDEX` (0, 1, 2, etc.)
- On macOS: Grant camera permissions in System Settings → Privacy & Security → Camera
- On Linux: Check if you're in the `video` group: `sudo usermod -a -G video $USER`

**Video not found (file mode):**
- Make sure `sample_video.mp4` exists in the backend directory
- Run `./download_sample_video.sh` to download a test video
- Check file permissions

**CORS errors:**
- Make sure flask-cors is installed
- Check that backend URL matches in frontend `.env`

**Connection refused:**
- Verify backend is running on port 8080
- Check firewall settings

**Poor video quality:**
- Increase JPEG quality in `generate_frames()` (higher = better quality but more bandwidth)
- Adjust camera resolution in `get_camera()`

**Low frame rate:**
- Reduce frame delay in `generate_frames()` 
- Check CPU usage (encoding frames is CPU-intensive)
- Lower video resolution or JPEG quality

