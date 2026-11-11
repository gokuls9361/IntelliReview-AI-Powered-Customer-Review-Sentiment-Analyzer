import time
import json
from pathlib import Path
from typing import Dict, Any, List, Optional
from app.config import BENCHMARK_RESULTS_PATH
from app.services.preprocessor import TextPreprocessor
from app.models.lstm_model import LSTMModel
from app.models.bilstm_model import BiLSTMModel
from app.models.transformer_model import DistilBERTModel
from app.models.absa_engine import AspectBasedSentimentAnalyzer
from app.services.keyword_extractor import KeywordAndIssueExtractor

class SentimentAnalysisService:
    """
    Central orchestration service for Deep Learning Sentiment Classification,
    Aspect-Based Sentiment Analysis, and Model Benchmarks.
    """

    def __init__(self):
        self.preprocessor = TextPreprocessor()
        self.lstm = LSTMModel()
        self.bilstm = BiLSTMModel()
        self.distilbert = DistilBERTModel()
        self.absa = AspectBasedSentimentAnalyzer()
        self.keyword_extractor = KeywordAndIssueExtractor()

    def get_models_metadata(self) -> Dict[str, Any]:
        """Loads and returns benchmark results and comparative metrics for all 3 models."""
        if BENCHMARK_RESULTS_PATH.exists():
            with open(BENCHMARK_RESULTS_PATH, "r", encoding="utf-8") as f:
                return json.load(f)
        return {"models": []}

    def analyze_review(self, text: str, model_type: str = "distilbert") -> Dict[str, Any]:
        """
        Executes sentiment classification using selected deep learning model
        and includes aspect-based sentiment extraction.
        """
        start_time = time.perf_counter()
        cleaned_text = self.preprocessor.clean_text(text)
        tokens = self.preprocessor.tokenize(text)

        selected_model = model_type.lower()
        if selected_model == "lstm":
            pred_class, confidence, probs = self.lstm.predict_probabilities(tokens)
            model_name = "LSTM"
        elif selected_model == "bilstm":
            pred_class, confidence, probs = self.bilstm.predict_probabilities(tokens)
            model_name = "Bidirectional LSTM (BiLSTM)"
        else:
            # Default to DistilBERT
            pred_class, confidence, probs = self.distilbert.predict_probabilities(text)
            model_name = "DistilBERT (Fine-Tuned)"
            selected_model = "distilbert"

        elapsed_ms = round((time.perf_counter() - start_time) * 1000, 2)

        # Aspect-based sentiment analysis
        absa_result = self.absa.analyze(text)

        # Top salient keywords in this review
        important_tokens = [t for t in tokens if len(t) > 3 and t not in self.preprocessor.vocab][:6]

        return {
            "review_text": text,
            "cleaned_text": cleaned_text,
            "model_used": {
                "id": selected_model,
                "name": model_name
            },
            "sentiment": pred_class,
            "confidence": confidence,
            "probabilities": probs,
            "latency_ms": elapsed_ms,
            "aspects": absa_result["detected_aspects"],
            "overall_aspect_sentiment": absa_result["overall_aspect_sentiment"],
            "key_tokens": important_tokens
        }

    def analyze_batch(self, reviews: List[Dict[str, Any]], model_type: str = "distilbert") -> Dict[str, Any]:
        """Processes a collection of customer reviews in batch mode."""
        results = []
        sentiment_counts = {"Positive": 0, "Negative": 0, "Neutral": 0}
        total_confidence = 0.0

        for r in reviews:
            text = r.get("review_text", "")
            if not text.strip():
                continue
            
            analysis = self.analyze_review(text, model_type=model_type)
            sentiment_counts[analysis["sentiment"]] += 1
            total_confidence += analysis["confidence"]

            results.append({
                "review_id": r.get("review_id", f"REV-{len(results)+1}"),
                "product_id": r.get("product_id", "GEN"),
                "product_name": r.get("product_name", "Product"),
                "rating": r.get("rating"),
                "review_text": text,
                "predicted_sentiment": analysis["sentiment"],
                "confidence": analysis["confidence"],
                "probabilities": analysis["probabilities"],
                "detected_aspects": [a["aspect"] for a in analysis["aspects"]],
                "created_at": r.get("created_at")
            })

        total = len(results)
        summary = {
            "total_reviews": total,
            "positive_count": sentiment_counts["Positive"],
            "negative_count": sentiment_counts["Negative"],
            "neutral_count": sentiment_counts["Neutral"],
            "positive_percentage": round((sentiment_counts["Positive"] / total * 100), 1) if total > 0 else 0,
            "negative_percentage": round((sentiment_counts["Negative"] / total * 100), 1) if total > 0 else 0,
            "neutral_percentage": round((sentiment_counts["Neutral"] / total * 100), 1) if total > 0 else 0,
            "average_confidence": round(total_confidence / total, 4) if total > 0 else 0
        }

        return {
            "summary": summary,
            "reviews": results
        }

    def compare_products(self, product_reviews: Dict[str, List[Dict[str, Any]]], model_type: str = "distilbert") -> List[Dict[str, Any]]:
        """
        Executes side-by-side comparative sentiment analysis across multiple products.
        Computes Net Sentiment Score, Aspect Strengths, and Complaint Drivers.
        """
        comparison = []
        for pid, rev_list in product_reviews.items():
            if not rev_list:
                continue
            prod_name = rev_list[0].get("product_name", pid)
            batch = self.analyze_batch(rev_list, model_type=model_type)
            summary = batch["summary"]
            
            # Net Sentiment Score = (% Positive) - (% Negative)
            nss = summary["positive_percentage"] - summary["negative_percentage"]

            # Aspect breakdown for this product
            aspect_scores: Dict[str, Dict[str, int]] = {}
            for r in batch["reviews"]:
                full_analysis = self.absa.analyze(r["review_text"])
                for asp in full_analysis["detected_aspects"]:
                    name = asp["aspect"]
                    pol = asp["sentiment"]
                    if name not in aspect_scores:
                        aspect_scores[name] = {"Positive": 0, "Negative": 0, "Neutral": 0}
                    aspect_scores[name][pol] += 1

            comparison.append({
                "product_id": pid,
                "product_name": prod_name,
                "total_reviews": summary["total_reviews"],
                "positive_percentage": summary["positive_percentage"],
                "negative_percentage": summary["negative_percentage"],
                "neutral_percentage": summary["neutral_percentage"],
                "net_sentiment_score": round(nss, 1),
                "average_confidence": summary["average_confidence"],
                "aspect_breakdown": aspect_scores
            })

        # Sort by Net Sentiment Score descending
        comparison.sort(key=lambda x: x["net_sentiment_score"], reverse=True)
        return comparison
