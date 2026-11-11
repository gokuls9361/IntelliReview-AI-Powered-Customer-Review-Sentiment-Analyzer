import re
from collections import Counter
from typing import List, Dict, Any
from app.services.preprocessor import STOPWORDS, PRESERVED_NEGATIONS

class KeywordAndIssueExtractor:
    """
    NLP service to identify commonly discussed topics, frequent complaints,
    and positive praise points from customer reviews.
    """

    def __init__(self):
        self.stopwords = STOPWORDS

    def extract_ngrams(self, texts: List[str], n: int = 2) -> Counter:
        """Extracts n-grams (bigrams/trigrams) from list of texts."""
        ngram_counts = Counter()
        for text in texts:
            words = [
                re.sub(r'[^a-zA-Z0-9]', '', w.lower())
                for w in text.split()
                if len(w) > 2
            ]
            words = [w for w in words if w and w not in self.stopwords]
            for i in range(len(words) - n + 1):
                gram = " ".join(words[i:i+n])
                ngram_counts[gram] += 1
        return ngram_counts

    def analyze_dataset_keywords(self, reviews: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Groups reviews by sentiment and extracts dominant keywords, issues, and praise points.
        """
        pos_texts = [r["review_text"] for r in reviews if r.get("sentiment") == "Positive"]
        neg_texts = [r["review_text"] for r in reviews if r.get("sentiment") == "Negative"]
        neu_texts = [r["review_text"] for r in reviews if r.get("sentiment") == "Neutral"]

        # Positive praise phrases
        pos_bigrams = self.extract_ngrams(pos_texts, n=2).most_common(10)
        pos_unigrams = self.extract_ngrams(pos_texts, n=1).most_common(12)

        # Negative pain points / issues
        neg_bigrams = self.extract_ngrams(neg_texts, n=2).most_common(10)
        neg_unigrams = self.extract_ngrams(neg_texts, n=1).most_common(12)

        # Frequent customer issues formatted with severity
        top_issues = [
            {"issue": gram, "occurrences": count, "category": "Hardware / Quality" if any(w in gram for w in ["screen", "battery", "cushion", "headache", "died"]) else "Service / Software"}
            for gram, count in neg_bigrams[:8]
        ]

        # Top positive highlights
        top_highlights = [
            {"highlight": gram, "occurrences": count, "category": "Feature / Delight"}
            for gram, count in pos_bigrams[:8]
        ]

        return {
            "top_customer_issues": top_issues,
            "top_positive_highlights": top_highlights,
            "positive_keywords": [{"word": w, "count": c} for w, c in pos_unigrams[:10]],
            "negative_keywords": [{"word": w, "count": c} for w, c in neg_unigrams[:10]],
            "common_bigrams": [{"phrase": phrase, "count": count} for phrase, count in (pos_bigrams[:5] + neg_bigrams[:5])]
        }
