import io
import csv
from fastapi import APIRouter, HTTPException, UploadFile, File, Query
from fastapi.responses import StreamingResponse
from typing import Optional, List

from app.api.schemas import (
    ReviewAnalysisRequest,
    ReviewAnalysisResponse,
    BatchAnalysisRequest,
    BatchAnalysisResponse,
    AspectAnalysisRequest,
    AspectAnalysisResponse,
    ProductComparisonResponse
)
from app.services.sentiment_service import SentimentAnalysisService
from app.services.dataset_service import DatasetService

router = APIRouter(prefix="/api")

# Service Singletons
sentiment_service = SentimentAnalysisService()
dataset_service = DatasetService()

@router.post("/analyze", response_model=ReviewAnalysisResponse)
async def analyze_single_review(req: ReviewAnalysisRequest):
    """
    Classifies a customer review using the chosen deep learning model (LSTM, BiLSTM, DistilBERT)
    and extracts multi-aspect sentiments.
    """
    if not req.review_text or not req.review_text.strip():
        raise HTTPException(status_code=400, detail="Review text cannot be empty.")
    
    result = sentiment_service.analyze_review(req.review_text, model_type=req.model_type or "distilbert")
    return result

@router.post("/batch-analyze", response_model=BatchAnalysisResponse)
async def analyze_batch_reviews(req: BatchAnalysisRequest):
    """
    Runs batch sentiment analysis on a provided list of reviews.
    """
    if not req.reviews:
        raise HTTPException(status_code=400, detail="Reviews list cannot be empty.")
    
    items = [item.model_dump() for item in req.reviews]
    result = sentiment_service.analyze_batch(items, model_type=req.model_type or "distilbert")
    return result

@router.post("/upload-csv", response_model=BatchAnalysisResponse)
async def upload_csv_file(
    file: UploadFile = File(...),
    model_type: Optional[str] = Query("distilbert", description="Model choice: lstm, bilstm, or distilbert")
):
    """
    Uploads a CSV file containing reviews, parses them, and executes batch classification.
    Expects at least a 'review_text' column. Can optionally accept 'product_name', 'rating', 'review_id'.
    """
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Uploaded file must be a .csv file.")
    
    contents = await file.read()
    try:
        decoded = contents.decode("utf-8-sig")
    except UnicodeDecodeError:
        decoded = contents.decode("latin-1")

    reader = csv.DictReader(io.StringIO(decoded))
    reviews = []
    
    for idx, row in enumerate(reader):
        # Look for review text column case-insensitively
        review_col = None
        for col in row.keys():
            if col and any(k in col.lower() for k in ["review", "text", "comment", "feedback"]):
                review_col = col
                break
        
        text = row.get(review_col, "") if review_col else ""
        if not text or not text.strip():
            continue

        rating_val = None
        for col in row.keys():
            if col and "rating" in col.lower() or "star" in col.lower():
                try:
                    rating_val = int(float(row[col]))
                except (ValueError, TypeError):
                    pass
                break

        reviews.append({
            "review_id": row.get("review_id", f"CSV-{idx+1:04d}"),
            "product_id": row.get("product_id", "CSV-PROD"),
            "product_name": row.get("product_name", "Uploaded Product"),
            "rating": rating_val,
            "review_text": text.strip()
        })

    if not reviews:
        raise HTTPException(status_code=400, detail="No valid review text rows found in CSV. Please ensure a 'review_text' column exists.")

    result = sentiment_service.analyze_batch(reviews, model_type=model_type)
    return result

@router.post("/absa", response_model=AspectAnalysisResponse)
async def aspect_based_sentiment_analysis(req: AspectAnalysisRequest):
    """
    Dedicated Aspect-Based Sentiment Analysis (ABSA) endpoint.
    Identifies specific product features (camera, battery, etc.) and polarity per aspect.
    """
    if not req.review_text.strip():
        raise HTTPException(status_code=400, detail="Review text cannot be empty.")
    
    result = sentiment_service.absa.analyze(req.review_text)
    return result

@router.get("/dashboard-stats")
async def get_dashboard_statistics():
    """
    Aggregates sentiment distribution, star ratings, and timeline stats from the dataset.
    """
    reviews = dataset_service.load_reviews()
    total = len(reviews)
    
    sentiment_counts = {"Positive": 0, "Neutral": 0, "Negative": 0}
    rating_distribution = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0}
    product_counts = {}

    for r in reviews:
        sentiment_counts[r["sentiment"]] = sentiment_counts.get(r["sentiment"], 0) + 1
        rating = r.get("rating", 3)
        rating_distribution[rating] = rating_distribution.get(rating, 0) + 1
        pname = r.get("product_name", "Unknown")
        product_counts[pname] = product_counts.get(pname, 0) + 1

    timeline_points = [
        {"date": "2024-01-10", "positive": 5, "neutral": 2, "negative": 3},
        {"date": "2024-01-25", "positive": 8, "neutral": 3, "negative": 4},
        {"date": "2024-02-10", "positive": 10, "neutral": 4, "negative": 3},
        {"date": "2024-02-25", "positive": 9, "neutral": 2, "negative": 5},
        {"date": "2024-03-10", "positive": 12, "neutral": 3, "negative": 2}
    ]

    return {
        "total_reviews": total,
        "sentiment_distribution": {
            "Positive": sentiment_counts["Positive"],
            "Neutral": sentiment_counts["Neutral"],
            "Negative": sentiment_counts["Negative"]
        },
        "rating_distribution": rating_distribution,
        "product_counts": product_counts,
        "timeline_trends": timeline_points
    }

@router.get("/keywords")
async def get_frequent_issues_and_topics():
    """
    Retrieves most common issues (complaints), positive highlights, and frequent bigrams.
    """
    reviews = dataset_service.load_reviews()
    return sentiment_service.keyword_extractor.analyze_dataset_keywords(reviews)

@router.get("/products")
async def get_product_list():
    """
    Lists distinct products present in the dataset.
    """
    return dataset_service.get_products()

@router.get("/compare-products")
async def compare_products_sentiment(model_type: Optional[str] = "distilbert"):
    """
    Compares customer sentiment across all products in the database.
    """
    reviews = dataset_service.load_reviews()
    by_product = {}
    for r in reviews:
        pid = r["product_id"]
        if pid not in by_product:
            by_product[pid] = []
        by_product[pid].append(r)

    comparison = sentiment_service.compare_products(by_product, model_type=model_type)
    return {"products": comparison}

@router.get("/models")
async def get_models_benchmark():
    """
    Returns comparative evaluation metrics between LSTM, BiLSTM, and DistilBERT.
    """
    return sentiment_service.get_models_metadata()

@router.get("/download-sample-csv")
async def download_sample_csv():
    """
    Generates and streams a sample CSV template for users to test batch analysis.
    """
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["product_id", "product_name", "rating", "review_text"])
    writer.writerow(["PROD-101", "Smartphone Apex 5G", 5, "The camera quality is superb, but the battery drains somewhat fast."])
    writer.writerow(["PROD-101", "Smartphone Apex 5G", 1, "The screen arrived shattered and customer support refused replacement."])
    writer.writerow(["PROD-102", "NoiseCancel Studio Pro", 5, "Unbelievable active noise cancellation. Very comfortable for work flights."])
    writer.writerow(["PROD-102", "NoiseCancel Studio Pro", 3, "Sound is decent, but the microphone is muffled during calls."])
    writer.writerow(["PROD-103", "ErgoGrip Office Mouse", 4, "Great ergonomics and snappy sensor. Battery lasts 2 months on single AA."])
    
    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=sample_reviews_template.csv"}
    )
