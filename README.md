# INTAI Surveillance Dashboard

A professional surveillance dashboard interface for real-time CCTV monitoring and target tracking. Features dual video feed display, target identification with confidence scoring, and comprehensive camera metadata visualization.

## Features

- **Dual Feed Display**: Side-by-side live and manipulated video streams
- **Target Tracking**: Real-time face detection with confidence scoring
- **Camera Metadata**: Comprehensive device and connection information
- **HUD Theme**: Dark professional interface with neon accents, scanlines, and grid overlays
- **Real-time Updates**: Smooth animations and live data refresh
- **Multiple Data Modes**: Support for demo, mock, and API modes
- **Type-Safe**: Full TypeScript with Zod validation

## Tech Stack

- React 18.2 with TypeScript
- Vite for fast development and builds
- Tailwind CSS for styling
- React Query for data fetching and caching
- Zod for runtime validation
- YouTube IFrame API for video embedding

## Quick Start

### Prerequisites

- Node.js 18+ and npm

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
# Data mode: "demo" (YouTube videos), "mock" (synthetic data), or "api" (live backend)
VITE_DATA_MODE=demo

# API configuration (only used when VITE_DATA_MODE=api)
VITE_API_BASE_URL=http://localhost:8080
VITE_DASHBOARD_PATH=/api/dashboard
```

## Data Modes

### Demo Mode

Demo mode uses YouTube video embeds for presentation purposes:
- Client-side only, no backend required
- YouTube videos with autoplay and loop
- Connecting animation before video display
- Static confidence at 93%
- Dynamic timestamp and latency updates

### Mock Mode

Mock mode runs entirely in the browser with synthetic data:
- Updates every 800ms to simulate live tracking
- Smooth bounding box animations
- Fluctuating confidence scores
- Occasional "offline" status to test error states

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

All bounding boxes use normalized coordinates (0.0 to 1.0):
- `x`: horizontal position (0 = left, 1 = right)
- `y`: vertical position (0 = top, 1 = bottom)
- `w`: width (0 to 1)
- `h`: height (0 to 1)

Example: `{x: 0.5, y: 0.5, w: 0.1, h: 0.2}` = centered box, 10% width, 20% height

### Adapting to Your API

If your backend returns different field names or structure:

1. Update Zod schema: Edit `src/types/dashboard.ts` to match your API
2. Add mapping layer: Modify `src/services/dashboardClient.ts` to transform your API response into `DashboardState`

## UI Controls

Located in the top-right corner:

- **BBOX**: Toggle bounding boxes on/off
- **TARGET**: Toggle target highlighting (red box for target, green for others)
- **SCAN**: Toggle scanline overlay effect
- **LAYOUT**: Toggle between side-by-side and stacked video layout
- **Mode Indicator**: Shows current data mode (DEMO, MOCK, or API)

## Project Structure

```
src/
├── components/
│   ├── DashboardPage.tsx      # Main layout and state management
│   ├── FeedPanel.tsx           # Video feed container
│   ├── VideoPlayer.tsx         # Video player (MP4 and YouTube)
│   ├── OverlayBoxes.tsx        # Canvas-based bounding boxes
│   ├── TargetPanel.tsx         # Target portrait + confidence
│   ├── MetaPanel.tsx           # Camera metadata display
│   └── TopBarControls.tsx      # UI controls
├── hooks/
│   └── useDashboard.ts         # React Query hook
├── services/
│   ├── dashboardClient.ts      # API abstraction layer
│   ├── demoData.ts             # Demo mode data generator
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

## Deployment

### GitHub Pages

This project is configured for automatic deployment to GitHub Pages:

1. Push code to the `main` branch
2. GitHub Actions will automatically build and deploy
3. Site will be available at `https://<username>.github.io/<repo-name>/`

The workflow is configured in `.github/workflows/deploy.yml`

## Troubleshooting

### Video Won't Play

- **Check URL**: Ensure video URLs are accessible and CORS-enabled
- **Autoplay Blocked**: Click the "CLICK TO START" overlay if shown
- **Format**: MP4 (H.264 codec) or YouTube embeds are supported

### "NO SIGNAL" Displayed

- **Demo mode**: Verify YouTube video IDs are correct in `src/services/demoData.ts`
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
- Optimized polling intervals for different data modes

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

Feel free to submit issues and pull requests.
