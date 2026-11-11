from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional

class ReviewAnalysisRequest(BaseModel):
    review_text: str = Field(..., description="The raw review text to analyze")
    model_type: Optional[str] = Field("distilbert", description="Model choice: 'lstm', 'bilstm', or 'distilbert'")

class AspectItem(BaseModel):
    aspect: str
    keyword: Optional[str] = None
    sentiment: str
    evidence_snippet: str

class ReviewAnalysisResponse(BaseModel):
    review_text: str
    cleaned_text: str
    model_used: Dict[str, str]
    sentiment: str
    confidence: float
    probabilities: Dict[str, float]
    latency_ms: float
    aspects: List[AspectItem]
    overall_aspect_sentiment: str
    key_tokens: List[str]

class BatchItem(BaseModel):
    review_id: Optional[str] = None
    product_id: Optional[str] = None
    product_name: Optional[str] = None
    rating: Optional[int] = None
    review_text: str

class BatchAnalysisRequest(BaseModel):
    reviews: List[BatchItem]
    model_type: Optional[str] = "distilbert"

class BatchSummary(BaseModel):
    total_reviews: int
    positive_count: int
    negative_count: int
    neutral_count: int
    positive_percentage: float
    negative_percentage: float
    neutral_percentage: float
    average_confidence: float

class BatchAnalysisResponse(BaseModel):
    summary: BatchSummary
    reviews: List[Dict[str, Any]]

class AspectAnalysisRequest(BaseModel):
    review_text: str

class AspectAnalysisResponse(BaseModel):
    review_text: str
    detected_aspects: List[AspectItem]
    total_aspects_found: int
    overall_aspect_sentiment: str

class ProductComparisonResponse(BaseModel):
    products: List[Dict[str, Any]]
