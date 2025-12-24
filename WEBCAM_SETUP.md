# 📹 Webcam Setup Guide

This guide shows you how to run the dashboard with your live webcam feed.

## Quick Setup (2 minutes)

### 1. Setup Backend (with webcam)

```bash
# Navigate to backend directory
cd backend

# Install dependencies
pip install -r requirements.txt

# Run the server (uses webcam by default)
python app.py
```

You should see:
```
📹 Mode: WEBCAM (Camera Index: 0)
   ✅ Camera detected and accessible
```

If you see a warning about camera access:
- **macOS**: Go to System Settings → Privacy & Security → Camera → Allow Terminal/your app
- **Linux**: Add yourself to video group: `sudo usermod -a -G video $USER`
- **Windows**: Check if another app is using the camera

### 2. Configure Frontend

In the project root, create/update `.env`:

```env
VITE_DATA_MODE=api
VITE_API_BASE_URL=http://localhost:8080
VITE_DASHBOARD_PATH=/api/dashboard
```

### 3. Run Frontend

```bash
# In project root (not in backend directory)
npm run dev
```

### 4. Open Browser

Navigate to: http://localhost:5173

You should see your live webcam feed in both panels! 🎉

---

## Troubleshooting

### Camera Not Detected

**"Cannot access camera" error:**

1. **Close other apps** that might be using the camera (Zoom, Skype, FaceTime, etc.)

2. **Check camera permissions** (macOS/Windows):
   - macOS: System Settings → Privacy & Security → Camera
   - Windows: Settings → Privacy → Camera

3. **Try a different camera** if you have multiple:
   ```python
   # In backend/app.py, change:
   CAMERA_INDEX = 0  # Try 1, 2, 3, etc.
   ```

4. **Test your camera** independently:
   ```bash
   # Quick Python test
   python3 -c "import cv2; cap = cv2.VideoCapture(0); print('Camera OK' if cap.isOpened() else 'Camera Error'); cap.release()"
   ```

### Video Shows Black Screen

- Wait a few seconds for the camera to initialize
- Check if camera LED is on (indicates camera is active)
- Try restarting the backend server
- Check browser console for errors (F12 → Console)

### Connection Errors

**"Failed to fetch" or CORS errors:**

1. Make sure backend is running: `curl http://localhost:8080/health`
2. Check that `.env` has correct URL: `VITE_API_BASE_URL=http://localhost:8080`
3. Restart both backend and frontend

### Low Frame Rate / Laggy

The video might be slow due to CPU encoding. To improve:

1. **Lower resolution** in `backend/app.py`:
   ```python
   camera.set(cv2.CAP_PROP_FRAME_WIDTH, 640)   # Lower res
   camera.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
   ```

2. **Reduce quality** in `generate_frames()`:
   ```python
   cv2.imencode('.jpg', frame, [cv2.IMWRITE_JPEG_QUALITY, 70])  # Lower quality
   ```

3. **Close other applications** to free up CPU

---

## Multiple Cameras

If you have multiple cameras (built-in + external):

```python
# In backend/app.py
CAMERA_INDEX = 0  # Built-in camera
CAMERA_INDEX = 1  # External USB camera
CAMERA_INDEX = 2  # Second external camera
# etc.
```

Test which index is which:
```bash
python3 -c "import cv2; [print(f'Camera {i}: {\"OK\" if cv2.VideoCapture(i).isOpened() else \"Not found\"}') for i in range(5)]"
```

---

## Switch Back to Mock Mode

To use mock data instead of the webcam:

1. Update `.env`:
   ```env
   VITE_DATA_MODE=mock
   ```

2. Restart frontend: `npm run dev`

Or use a video file instead of webcam:

1. Edit `backend/app.py`:
   ```python
   USE_WEBCAM = False
   ```

2. Download test video: `cd backend && ./download_sample_video.sh`

3. Restart backend: `python app.py`

---

## How It Works

1. **Backend**: Captures frames from your webcam using OpenCV
2. **Streaming**: Encodes frames as JPEG and streams via MJPEG protocol
3. **Frontend**: Displays the MJPEG stream using an `<img>` tag
4. **Detections**: Bounding boxes are generated dynamically on the frontend

Both "live" and "manipulated" feeds show the same camera for testing purposes. In a real scenario, the manipulated feed would show processed/analyzed video.

---

## Next Steps

- Add real face detection (OpenCV Haar Cascades, YOLO, etc.)
- Process frames before streaming (add filters, overlays, etc.)
- Use multiple cameras for different feeds
- Deploy to a server for remote access

Enjoy your live surveillance dashboard! 🎯


