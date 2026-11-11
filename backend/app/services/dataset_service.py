import csv
from pathlib import Path
from typing import List, Dict, Any, Optional
from app.config import SAMPLE_REVIEWS_PATH, RATING_MAP

class DatasetService:
    """Manages loading, parsing, and persisting review datasets."""

    def __init__(self, csv_path: Path = SAMPLE_REVIEWS_PATH):
        self.csv_path = csv_path
        self._cache: Optional[List[Dict[str, Any]]] = None

    def load_reviews(self, reload: bool = False) -> List[Dict[str, Any]]:
        """Loads and returns reviews from CSV."""
        if self._cache is not None and not reload:
            return self._cache

        reviews = []
        if self.csv_path.exists():
            with open(self.csv_path, mode="r", encoding="utf-8") as f:
                reader = csv.DictReader(f)
                for row in reader:
                    rating = int(row.get("rating", 3))
                    sentiment = row.get("sentiment") or RATING_MAP.get(rating, "Neutral")
                    reviews.append({
                        "review_id": row.get("review_id", f"REV-{len(reviews)+1:03d}"),
                        "product_id": row.get("product_id", "PROD-GEN"),
                        "product_name": row.get("product_name", "General Product"),
                        "rating": rating,
                        "review_text": row.get("review_text", ""),
                        "sentiment": sentiment,
                        "created_at": row.get("created_at", "2024-01-01")
                    })
        self._cache = reviews
        return reviews

    def get_products(self) -> List[Dict[str, str]]:
        """Returns distinct product IDs and names."""
        reviews = self.load_reviews()
        products = {}
        for r in reviews:
            pid = r["product_id"]
            if pid not in products:
                products[pid] = r["product_name"]
        return [{"product_id": k, "product_name": v} for k, v in products.items()]

    def get_reviews_for_product(self, product_id: str) -> List[Dict[str, Any]]:
        """Filters reviews by a specific product."""
        reviews = self.load_reviews()
        return [r for r in reviews if r["product_id"] == product_id]

    def add_review(self, review: Dict[str, Any]) -> Dict[str, Any]:
        """Appends a new review in memory and persists to CSV."""
        reviews = self.load_reviews()
        reviews.append(review)
        
        # Write back to CSV
        fieldnames = ["review_id", "product_id", "product_name", "rating", "review_text", "sentiment", "created_at"]
        with open(self.csv_path, mode="w", encoding="utf-8", newline="") as f:
            writer = csv.DictWriter(f, fieldnames=fieldnames)
            writer.writeheader()
            for r in reviews:
                writer.writerow({k: r.get(k, "") for k in fieldnames})
        
        self._cache = reviews
        return review
