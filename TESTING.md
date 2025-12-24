# Testing Guide

## Testing with Mock Data (No Videos)

The dashboard works perfectly without any video URLs. Simply run:

```bash
npm install
npm run dev
```

You'll see:
- ✅ Target portrait (generated silhouette)
- ✅ Live confidence updates
- ✅ Animated bounding boxes
- ✅ Camera metadata
- ✅ All UI controls
- ⚠️ "NO SIGNAL" in video panels (expected without URLs)

## Testing with Sample Videos

To see the full experience, you need two MP4 files. Here are some options:

### Option 1: Use Free Test Videos

Create a `.env` file with these sample URLs:

```env
VITE_DATA_MODE=mock
VITE_MOCK_LIVE_MP4_URL=https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4
VITE_MOCK_MANIP_MP4_URL=https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4
```

### Option 2: Use Your Own MP4 Files

1. Place MP4 files in `public/` folder:
   ```
   public/
   ├── live.mp4
   └── manip.mp4
   ```

2. Update `.env`:
   ```env
   VITE_MOCK_LIVE_MP4_URL=/live.mp4
   VITE_MOCK_MANIP_MP4_URL=/manip.mp4
   ```

### Option 3: Host Videos Yourself

Use any static file hosting or CDN that serves MP4 with proper CORS headers:
- AWS S3 (with CORS configured)
- Cloudflare R2
- Vercel/Netlify static files
- Local server with CORS enabled

**Important**: Videos must be:
- MP4 format (H.264 codec recommended)
- Accessible via HTTPS (or HTTP for localhost)
- CORS-enabled if hosted on different domain

## Testing API Mode

### Minimal Test Server

Create a simple test server (e.g., `test-server.js`):

```javascript
// test-server.js
const http = require('http');

const mockResponse = {
  timestamp: new Date().toISOString(),
  feeds: {
    live: { type: 'mp4', url: 'https://example.com/live.mp4' },
    manipulated: { type: 'mp4', url: 'https://example.com/manip.mp4' }
  },
  target: {
    portraitUrl: 'https://via.placeholder.com/200',
    confidence: 0.20 + Math.random() * 0.15,
    label: 'TEST TARGET'
  },
  cameraMeta: {
    cameraId: 'TEST-001',
    cameraName: 'Test Camera',
    location: 'Test Location',
    status: 'online',
    latencyMs: 100,
    fps: 30,
    resolution: '1920x1080',
    device: { model: 'Test Model' }
  },
  detections: [
    {
      id: 'd1',
      feed: 'live',
      bbox: { x: 0.3, y: 0.2, w: 0.1, h: 0.2 },
      confidence: 0.85,
      isTarget: true
    }
  ]
};

const server = http.createServer((req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');
  
  if (req.url === '/api/dashboard') {
    // Add slight randomness for testing
    mockResponse.timestamp = new Date().toISOString();
    mockResponse.target.confidence = 0.15 + Math.random() * 0.20;
    res.end(JSON.stringify(mockResponse));
  } else {
    res.statusCode = 404;
    res.end('Not found');
  }
});

server.listen(8080, () => {
  console.log('Test server running on http://localhost:8080');
});
```

Run it:
```bash
node test-server.js
```

Update `.env`:
```env
VITE_DATA_MODE=api
VITE_API_BASE_URL=http://localhost:8080
```

## UI Testing Checklist

- [ ] Dashboard loads without errors
- [ ] Target portrait displays
- [ ] Confidence percentage updates
- [ ] Camera metadata shows all fields
- [ ] Both video panels render (or show "NO SIGNAL" if URLs missing)
- [ ] Bounding boxes draw on videos
- [ ] Target detection has red border (when "TARGET" toggle on)
- [ ] "LIVE" dot pulses
- [ ] Scanlines effect visible (toggle with "SCAN" button)
- [ ] Timestamp updates continuously
- [ ] Toggle controls work (BBOX, TARGET, SCAN)
- [ ] "MOCK MODE" or "API MODE" indicator shows correctly
- [ ] Grid background visible
- [ ] Corner ornaments on portrait frame
- [ ] Metadata renders unknown device fields correctly

## Performance Testing

Monitor in Chrome DevTools:
- Should maintain 60fps with scanlines enabled
- Canvas overlay redraws should be < 16ms per frame
- Memory should stay stable (no leaks from video/canvas)

## Browser Testing

Test in:
- Chrome/Edge (primary target)
- Firefox
- Safari (check video autoplay behavior)

## Common Issues & Solutions

### Videos don't autoplay
- **Solution**: Click the "CLICK TO START" overlay (browsers block autoplay)

### CORS errors in console
- **Solution**: Host videos on same domain or configure CORS headers on video server

### Bounding boxes flicker
- **Expected**: Normal in mock mode due to rapid updates. Real API should update less frequently (1-2 fps).

### High CPU usage
- **Check**: Are videos very high resolution (4K)? Use 1080p or lower.
- **Check**: Too many detections? Keep under 20-30 per frame.

### Layout breaks on small screens
- **Note**: Dashboard is optimized for desktop (1920x1080+). Mobile not fully supported.

## Next Steps

Once basic testing works:
1. Connect to your real backend API
2. Adjust schemas in `src/types/dashboard.ts` if needed
3. Add mapping in `src/services/dashboardClient.ts` for your API format
4. Test with real video streams
5. Tune refresh rates for your use case


