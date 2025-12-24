# INTAI Surveillance Dashboard

A dark-themed, hacking-tool styled web UI for real-time CCTV surveillance and target tracking. Features live and manipulated video feeds, target identification with confidence scoring, and comprehensive camera metadata display.

![Dashboard Preview](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)
![React](https://img.shields.io/badge/React-18.2-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)
![Tailwind](https://img.shields.io/badge/Tailwind-3.4-38bdf8)

## Features

- 🎯 **Dual Feed Display**: Side-by-side live and manipulated video streams
- 👤 **Target Tracking**: Real-time face detection with confidence scoring
- 📊 **Camera Metadata**: Comprehensive device and connection information
- 🎨 **HUD Theme**: Dark cyberpunk aesthetic with neon accents, scanlines, and grid overlays
- 🔄 **Real-time Updates**: Smooth animations and live data refresh
- 🔌 **API Ready**: Easy switch between mock data and real backend
- 📦 **Type-Safe**: Full TypeScript with Zod validation

## Tech Stack

- **React 18.2** with TypeScript
- **Vite** for blazing-fast development
- **Tailwind CSS** for styling
- **React Query** for data fetching and caching
- **Zod** for runtime validation
- **Native HTML5 Video** for MP4 playback

## Quick Start

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The application will open at `http://localhost:5173`

### Build for Production

```bash
# Build optimized production bundle
npm run build

# Preview production build
npm run preview
```

## Configuration

Create a `.env` file in the project root:

```env
# Data mode: "mock" (default) or "api"
VITE_DATA_MODE=mock

# API configuration (only used when VITE_DATA_MODE=api)
VITE_API_BASE_URL=http://localhost:8080
VITE_DASHBOARD_PATH=/api/dashboard

# Mock MP4 URLs (optional, for testing with real videos)
VITE_MOCK_LIVE_MP4_URL=https://example.com/live.mp4
VITE_MOCK_MANIP_MP4_URL=https://example.com/manip.mp4
```

## Test Backend (Included)

A Python Flask backend is included with **live webcam support**. See `backend/` directory.

**Quick setup (uses your webcam):**
```bash
cd backend
pip install -r requirements.txt
python app.py
```

Then update your `.env`:
```env
VITE_DATA_MODE=api
```

**Features:**
- 📹 Live webcam streaming (MJPEG)
- 📊 Real camera metadata extraction
- 🎯 Dynamic detection simulation
- 🔄 Easy switch between webcam and video file

See `backend/README.md` for full documentation or `WEBCAM_SETUP.md` for webcam-specific guide.

### Mock Mode (Default)

In mock mode, the dashboard runs entirely in the browser with synthetic data:
- Updates every 800ms to simulate live tracking
- Smooth bounding box animations
- Fluctuating confidence scores
- Occasional "offline" status to test error states

**Note**: If `VITE_MOCK_LIVE_MP4_URL` and `VITE_MOCK_MANIP_MP4_URL` are not provided, video panels will display "NO SIGNAL" placeholders. The rest of the UI will work normally.

### API Mode

Switch to API mode to connect to a real backend:

```env
VITE_DATA_MODE=api
VITE_API_BASE_URL=http://your-backend.com
VITE_DASHBOARD_PATH=/api/dashboard
```

## API Integration

### Expected Response Format

Your backend should return JSON matching this schema (see `src/types/dashboard.ts` for full details):

```json
{
  "timestamp": "2025-12-23T10:20:30Z",
  "feeds": {
    "live": {
      "type": "mp4",
      "url": "https://backend.com/streams/live.mp4"
    },
    "manipulated": {
      "type": "mp4",
      "url": "https://backend.com/streams/manip.mp4"
    }
  },
  "target": {
    "portraitUrl": "https://backend.com/assets/target.jpg",
    "confidence": 0.20,
    "label": "UNKNOWN SUBJECT"
  },
  "cameraMeta": {
    "cameraId": "R-39-F-003",
    "cameraName": "CAM 41A",
    "location": "Terminal 2 / Concourse F",
    "status": "online",
    "latencyMs": 84,
    "fps": 30,
    "resolution": "1920x1080",
    "device": {
      "model": "AXIS Q3517-LVE",
      "firmware": "11.6.92",
      "ip": "10.0.12.44",
      "codec": "H.264"
    }
  },
  "detections": [
    {
      "id": "d1",
      "feed": "live",
      "bbox": {
        "x": 0.42,
        "y": 0.18,
        "w": 0.10,
        "h": 0.22
      },
      "confidence": 0.78,
      "isTarget": true
    }
  ]
}
```

### Bounding Box Coordinates

All bounding boxes use **normalized coordinates** (0.0 to 1.0):
- `x`: horizontal position (0 = left, 1 = right)
- `y`: vertical position (0 = top, 1 = bottom)
- `w`: width (0 to 1)
- `h`: height (0 to 1)

Example: `{x: 0.5, y: 0.5, w: 0.1, h: 0.2}` = centered box, 10% width, 20% height

### Adapting to Your API

If your backend returns different field names or structure:

1. **Update Zod schema**: Edit `src/types/dashboard.ts` to match your API
2. **Add mapping layer**: Modify `src/services/dashboardClient.ts` to transform your API response into `DashboardState`

Example mapping:

```typescript
// In dashboardClient.ts
async function fetchFromAPI(): Promise<DashboardState> {
  const response = await fetch(url);
  const rawData = await response.json();
  
  // Map your API format to DashboardState
  const mapped: DashboardState = {
    timestamp: rawData.ts,
    feeds: {
      live: { type: 'mp4', url: rawData.video_urls.main },
      manipulated: { type: 'mp4', url: rawData.video_urls.processed },
    },
    target: {
      portraitUrl: rawData.target.image,
      confidence: rawData.target.match_score,
      label: rawData.target.name,
    },
    // ... etc
  };
  
  return DashboardStateSchema.parse(mapped);
}
```

## UI Controls

Located in the top-right corner:

- **BBOX**: Toggle bounding boxes on/off
- **TARGET**: Toggle target highlighting (red box for target, green for others)
- **SCAN**: Toggle scanline overlay effect
- **Mode Indicator**: Shows current data mode (MOCK or API)

## Project Structure

```
src/
├── components/
│   ├── DashboardPage.tsx      # Main layout and state management
│   ├── FeedPanel.tsx           # Video feed container
│   ├── VideoPlayer.tsx         # MP4 video player
│   ├── OverlayBoxes.tsx        # Canvas-based bounding boxes
│   ├── TargetPanel.tsx         # Target portrait + confidence
│   ├── MetaPanel.tsx           # Camera metadata display
│   └── TopBarControls.tsx      # UI controls
├── hooks/
│   └── useDashboard.ts         # React Query hook
├── services/
│   ├── dashboardClient.ts      # API abstraction layer
│   └── mockData.ts             # Mock data generator
├── types/
│   └── dashboard.ts            # TypeScript types + Zod schemas
├── App.tsx                     # App root with providers
├── main.tsx                    # Entry point
└── index.css                   # Tailwind + custom HUD styles
```

## Customization

### Colors

Edit `tailwind.config.js` to change the color scheme:

```javascript
colors: {
  'hud-accent': '#00ff9d',    // Neon green
  'hud-cyan': '#00d9ff',      // Cyan
  'hud-red': '#ff0040',       // Red
  // ... etc
}
```

### Styling Effects

- **Scanlines**: Adjust opacity in `src/index.css` → `.scanlines`
- **Grid**: Modify grid size in `.grid-bg`
- **Glow effects**: Update box-shadow values in `.hud-panel`

### Data Refresh Rate

Change polling interval in `src/hooks/useDashboard.ts`:

```typescript
const refetchInterval = dataMode === 'mock' ? 800 : 2000; // milliseconds
```

## Troubleshooting

### Video Won't Play

- **Check URL**: Ensure MP4 URLs are accessible and CORS-enabled
- **Autoplay Blocked**: Click the "CLICK TO START" overlay
- **Format**: Only MP4 is supported (H.264 codec recommended)

### "NO SIGNAL" Displayed

- **Mock mode**: Set `VITE_MOCK_LIVE_MP4_URL` and `VITE_MOCK_MANIP_MP4_URL` in `.env`
- **API mode**: Verify backend is returning valid `feeds.live.url` and `feeds.manipulated.url`

### Bounding Boxes Not Appearing

- Ensure `BBOX` toggle is enabled (top-right)
- Check that `detections` array in API response has items
- Verify bbox coordinates are normalized (0–1 range)

### TypeScript Errors After API Changes

1. Update `src/types/dashboard.ts` with new schema
2. Restart dev server: `npm run dev`
3. If errors persist, delete `node_modules/.vite` and restart

## Performance

- Canvas-based overlays are memoized to prevent unnecessary re-renders
- React Query caches responses and deduplicates requests
- Video decoding happens in the browser (hardware-accelerated)

For best performance:
- Use 1080p or lower resolution videos
- Keep detection arrays under 50 items
- Use a modern browser (Chrome/Edge/Safari recommended)

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

Requires: ES2020, native video element, canvas 2D context

## License

MIT

## Contributing

Feel free to submit issues and pull requests!

---

**Built with ⚡ by INTAI Team**

