# Quick Start Guide

## 🚀 Get Running in 2 Minutes

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Run the App
```bash
npm run dev
```

### Step 3: Open Browser
Navigate to: **http://localhost:5173**

That's it! The dashboard runs with mock data by default.

---

## 📝 What You'll See

- **Left Panel**: Target portrait with match confidence % and camera metadata
- **Center**: Live feed panel (shows "NO SIGNAL" without video URL)
- **Right**: Manipulated feed panel (shows "NO SIGNAL" without video URL)
- **Top Right**: UI controls (BBOX, TARGET, SCAN toggles)

The UI will update every 800ms with:
- Moving bounding boxes
- Fluctuating confidence scores
- Live timestamps
- Pulsing "LIVE" indicator

---

## 🎥 Add Test Videos (Optional)

Create a `.env` file:

```env
VITE_DATA_MODE=mock
VITE_MOCK_LIVE_MP4_URL=https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4
VITE_MOCK_MANIP_MP4_URL=https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4
```

Restart the dev server, and you'll see videos playing with animated bounding boxes!

---

## 🔌 Connect to Your Backend

Update `.env`:

```env
VITE_DATA_MODE=api
VITE_API_BASE_URL=http://your-backend.com
VITE_DASHBOARD_PATH=/api/dashboard
```

Your backend must return JSON matching the format in **README.md** → "API Integration" section.

---

## 📚 Full Documentation

- **README.md** - Complete setup, API format, customization
- **TESTING.md** - Testing strategies, sample videos, troubleshooting

## 🎨 UI Features Included

✅ Dark HUD theme with neon accents  
✅ Scanline and grid overlays  
✅ Glowing borders and corner ornaments  
✅ Pulsing "LIVE" indicator  
✅ Canvas-based bounding boxes  
✅ Real-time confidence updates  
✅ Smooth animations  
✅ Toggle controls  
✅ Error states ("SIGNAL LOST", "NO SIGNAL")  
✅ Mode indicator (MOCK/API)  

Enjoy! 🎯


