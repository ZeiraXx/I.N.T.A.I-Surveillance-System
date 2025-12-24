# FastAPI + Uvicorn Backend

## Why FastAPI?

FastAPI with Uvicorn provides:
- ⚡ Better performance than Flask
- 📚 Automatic API documentation (Swagger UI)
- 🔄 Auto-reload during development
- ✅ Modern async support
- 📝 Type hints and validation

## Setup

### 1. Install dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. Run with Uvicorn

**Method 1: Direct Python**
```bash
python main.py
```

**Method 2: Via uvicorn command**
```bash
uvicorn main:app --host 0.0.0.0 --port 8080 --reload
```

**Method 3: Using the script**
```bash
./run_uvicorn.sh
```

## Features

All endpoints same as Flask version:
- `GET /api/dashboard` - Dashboard data
- `GET /api/video/{feed_type}` - Video stream (live or manipulated)
- `GET /health` - Health check
- `GET /docs` - **NEW!** Interactive API documentation (Swagger UI)
- `GET /redoc` - **NEW!** Alternative API documentation

## Interactive API Docs

FastAPI automatically generates interactive API documentation:

- **Swagger UI**: http://localhost:8080/docs
- **ReDoc**: http://localhost:8080/redoc

You can test all endpoints directly from the browser!

## Development Mode

Uvicorn's `--reload` flag automatically restarts the server when you change code:

```bash
uvicorn main:app --host 0.0.0.0 --port 8080 --reload
```

## Configuration

Same as Flask version - edit `main.py`:

```python
USE_WEBCAM = True   # Use webcam (default)
CAMERA_INDEX = 0    # Which camera
```

## Performance

FastAPI with Uvicorn typically handles:
- 2-3x more requests per second than Flask
- Lower latency
- Better concurrent request handling

Perfect for real-time video streaming!

## Differences from Flask

1. **Async support**: Can use `async def` for endpoints
2. **Type hints**: Request/response models with Pydantic
3. **Auto docs**: Built-in Swagger UI
4. **CORS**: Configured via middleware (already set up)
5. **Startup/Shutdown**: Use `@app.on_event()` decorators

## Migration Notes

The FastAPI version (`main.py`) is functionally identical to Flask (`app.py`). Both:
- Use same camera capture logic
- Return same JSON structure
- Stream video via MJPEG
- Have same configuration options

Choose whichever you prefer!

## Troubleshooting

**Import errors:**
```bash
pip install fastapi uvicorn[standard]
```

**Port already in use:**
```bash
uvicorn main:app --host 0.0.0.0 --port 8081
# Then update frontend .env: VITE_API_BASE_URL=http://localhost:8081
```

**Slow startup:**
First run might be slow while uvicorn loads. Subsequent starts are fast with `--reload`.


