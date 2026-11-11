import unittest
import sys
from pathlib import Path

# Add backend to sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.services.preprocessor import TextPreprocessor
from app.models.lstm_model import LSTMModel
from app.models.bilstm_model import BiLSTMModel
from app.models.transformer_model import DistilBERTModel
from app.models.absa_engine import AspectBasedSentimentAnalyzer
from app.services.keyword_extractor import KeywordAndIssueExtractor

class TestSentimentPipeline(unittest.TestCase):

    def setUp(self):
        self.preprocessor = TextPreprocessor()
        self.lstm = LSTMModel()
        self.bilstm = BiLSTMModel()
        self.distilbert = DistilBERTModel()
        self.absa = AspectBasedSentimentAnalyzer()
        self.keywords = KeywordAndIssueExtractor()

    def test_preprocessor_contractions(self):
        text = "I don't like this phone and it's terrible"
        cleaned = self.preprocessor.clean_text(text)
        self.assertIn("do not", cleaned)
        self.assertIn("terrible", cleaned)

    def test_positive_classification(self):
        text = "The sound quality is mind-blowing and excellent!"
        pred, conf, probs = self.distilbert.predict_probabilities(text)
        self.assertEqual(pred, "Positive")
        self.assertGreater(conf, 0.7)

    def test_negative_classification(self):
        text = "Worst purchase ever, screen cracked and broke in one day."
        pred, conf, probs = self.distilbert.predict_probabilities(text)
        self.assertEqual(pred, "Negative")
        self.assertGreater(conf, 0.7)

    def test_absa_multi_aspect(self):
        review = "The camera quality is excellent, but the battery backup is terrible."
        result = self.absa.analyze(review)
        self.assertEqual(result["overall_aspect_sentiment"], "Mixed")
        aspect_names = [a["aspect"] for a in result["detected_aspects"]]
        self.assertIn("Camera Quality", aspect_names)
        self.assertIn("Battery Life", aspect_names)

    def test_keyword_extraction(self):
        reviews = [
            {"review_text": "Battery drain is terrible and battery backup fails.", "sentiment": "Negative"},
            {"review_text": "Battery drain constantly ruins the experience.", "sentiment": "Negative"},
            {"review_text": "Super fast charging and amazing camera photos.", "sentiment": "Positive"}
        ]
        res = self.keywords.analyze_dataset_keywords(reviews)
        self.assertTrue(len(res["top_customer_issues"]) > 0)
        self.assertTrue(len(res["top_positive_highlights"]) > 0)

if __name__ == "__main__":
    unittest.main()
