# Demo Mode Guide

Demo mode runs completely **client-side** without needing the backend. Perfect for presentations and demos.

## Features

✅ **No backend required** - Runs entirely in the browser  
✅ **Static metadata** - Consistent camera info without camera access  
✅ **93% match after 2 seconds** - Confidence fluctuates randomly (10-35%), jumps to 93% after 2 seconds and stays static  
✅ **No bounding boxes** - Clean video playback  
✅ **Looping videos** - Videos loop automatically from the public folder  
✅ **Ultra-low bandwidth** - Only ~20 API calls total (for animation), then stops completely  

## Setup

### 1. Place videos in public folder
```
public/
├── phase4_original.mp4   (live feed)
├── phase4_removed.mp4    (manipulated feed)
├── VIP1.jpg              (target portrait)
└── twistcode_logo.png    (company logo)
```

### 2. Configure .env
```env
VITE_DATA_MODE=demo
```

That's it! No backend needed.

### 3. Run frontend only
```bash
npm run dev
```

## Behavior

- **Confidence**: Fluctuates randomly (10-35%) for first 2 seconds, then jumps to **93%** and stays static
- **Polling**: Updates every 100ms for first 2 seconds, then **stops completely** (zero bandwidth!)
- **Metadata**: Static values (camera ID, location, resolution, etc.)
- **Videos**: Served from public folder, loop automatically
- **Controls**: BBOX, TARGET, SCAN toggles are disabled (grayed out)
- **Webcam**: Not accessed at all

## For Public Access (ngrok)

Since demo mode runs client-side, you only need to expose the frontend:

```bash
# Run frontend
npm run dev

# Expose via ngrok
ngrok http 5173
```

Share the ngrok URL - no backend setup needed!

## Switching Modes

### To Mock Mode (synthetic data + animations)
```env
VITE_DATA_MODE=mock
```
- Animated bounding boxes
- Moving detections
- Fluctuating confidence

### To API Mode (live backend)
```env
VITE_DATA_MODE=api
VITE_API_BASE_URL=http://localhost:8080
```
- Requires backend running
- Live webcam or video stream
- Real-time detection data

## Technical Details

Demo mode uses `demoGenerator` which:
- Tracks elapsed time from start
- Returns static metadata
- Generates random confidence (10-35%) for first 2 seconds
- Switches confidence to 93% at 2 seconds and keeps it static
- Returns empty detections array (no bounding boxes)

The polling stops completely after 2 seconds to save bandwidth (perfect for ngrok free tier!).

