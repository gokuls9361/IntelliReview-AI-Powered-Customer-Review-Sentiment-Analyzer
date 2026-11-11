import sys
import os
from pathlib import Path

# Add backend root to sys.path
BASE_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(BASE_DIR))

port = int(os.environ.get("PORT", 8000))

# Try running with FastAPI & Uvicorn if installed, otherwise run high-performance built-in server
try:
    import fastapi
    import uvicorn
    print(f"🚀 Starting FastAPI with Uvicorn on http://127.0.0.1:{port}")
    uvicorn.run("app.main:app", host="127.0.0.1", port=port, reload=False)
except ImportError:
    import server
    print(f"🚀 Starting SentifyAI Core HTTP Server on http://127.0.0.1:{port}")
    server.run_server(port=port)
