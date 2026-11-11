from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import router

app = FastAPI(
    title="Customer Review Sentiment & ABSA Intelligence API",
    description="Deep Learning Sentiment Classification System comparing LSTM, BiLSTM, and DistilBERT with Aspect-Based Sentiment Analysis and Product Insights.",
    version="1.0.0"
)

# Enable CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routes
app.include_router(router)

@app.get("/")
def root():
    return {
        "status": "online",
        "service": "Customer Review Sentiment Analysis & ABSA System",
        "models_available": ["LSTM", "BiLSTM", "DistilBERT"],
        "docs_url": "/docs"
    }

@app.get("/health")
def health_check():
    return {"status": "healthy"}
