import os
from pathlib import Path

# Paths
BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"
SAMPLE_REVIEWS_PATH = DATA_DIR / "sample_reviews.csv"
BENCHMARK_RESULTS_PATH = DATA_DIR / "benchmark_results.json"
MODEL_WEIGHTS_DIR = DATA_DIR / "weights"
DB_PATH = DATA_DIR / "sentiment_app.db"

# Create directories if they do not exist
DATA_DIR.mkdir(parents=True, exist_ok=True)
MODEL_WEIGHTS_DIR.mkdir(parents=True, exist_ok=True)

# Sentiment labels
SENTIMENT_CLASSES = ["Negative", "Neutral", "Positive"]
LABEL_TO_ID = {"Negative": 0, "Neutral": 1, "Positive": 2}
ID_TO_LABEL = {0: "Negative", 1: "Neutral", 2: "Positive"}

# Star Rating Mapping
RATING_MAP = {
    1: "Negative",
    2: "Negative",
    3: "Neutral",
    4: "Positive",
    5: "Positive"
}

# Hyperparameters
MAX_SEQUENCE_LENGTH = 128
VOCAB_SIZE = 10000
EMBEDDING_DIM = 128
HIDDEN_DIM = 128
NUM_CLASSES = 3
DROPOUT_RATE = 0.3
BATCH_SIZE = 32
LEARNING_RATE = 1e-3

# Database URL
DATABASE_URL = f"sqlite:///{DB_PATH}"
