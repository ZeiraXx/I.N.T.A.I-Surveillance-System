# Backend Quick Start

## Get running in 2 steps:

### Step 1: Install dependencies
```bash
cd backend
pip install -r requirements.txt
```

### Step 2: Run the server (uses your webcam by default)

**Option A: FastAPI with Uvicorn (recommended):**
```bash
python main.py
```

**Option B: Flask:**
```bash
python app.py
```

Backend will be available at: `http://localhost:8080`

**Note:** The backend uses your webcam by default. If you want to use a video file instead:
1. Edit `app.py` and set `USE_WEBCAM = False`
2. Download a test video: `./download_sample_video.sh`
3. Run `python app.py`

---

## Test the API

```bash
# Health check
curl http://localhost:8080/health

# Get dashboard data
curl http://localhost:8080/api/dashboard | jq
```

---

## Connect Frontend

In your frontend root directory, create/update `.env`:

```env
VITE_DATA_MODE=api
VITE_API_BASE_URL=http://localhost:8080
VITE_DASHBOARD_PATH=/api/dashboard
```

Restart frontend:
```bash
npm run dev
```

The dashboard should now show video from your backend! 🎉

