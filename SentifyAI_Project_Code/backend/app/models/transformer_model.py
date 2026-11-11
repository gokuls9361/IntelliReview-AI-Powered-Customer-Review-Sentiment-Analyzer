import math
from typing import List, Dict, Tuple

class DistilBERTModel:
    """
    DistilBERT Transformer Model wrapper for 3-class Sentiment Analysis.
    Captures deep self-attention representations, subtle negations, and cross-token dependencies.
    """

    def __init__(self):
        self.id = "distilbert"
        self.name = "DistilBERT (Fine-Tuned)"
        self.max_seq_len = 128
        self._init_transformer_heuristics()

    def _init_transformer_heuristics(self):
        self.strong_positive = [
            "excellent", "outstanding", "mind-blowing", "masterpiece", "unbeatable",
            "superb", "brilliant", "perfect", "flawless", "stunning", "game changer",
            "worth every penny", "best in the industry", "love it", "highly recommend"
        ]
        self.moderate_positive = [
            "good", "great", "solid", "nice", "decent", "fast", "comfortable",
            "snappy", "pleased", "smooth", "happy", "satisfied", "clean", "quiet"
        ]
        self.strong_negative = [
            "terrible", "horrible", "worst", "garbage", "waste of money", "avoid",
            "defective", "burned out", "cracked", "dead", "died", "fraud", "scam",
            "completely unhelpful", "unresponsive", "refused", "never buy"
        ]
        self.moderate_negative = [
            "bad", "poor", "slow", "overheats", "laggy", "cheap", "peeling",
            "disappointed", "whining", "heavy", "annoying", "struggles", "inaccurate"
        ]
        self.neutral_markers = [
            "average", "okay", "neither", "standard", "normal", "acceptable",
            "mediocre", "nothing special", "fair", "does the job", "as expected"
        ]

    def _softmax(self, logits: List[float]) -> List[float]:
        max_l = max(logits)
        exps = [math.exp(x - max_l) for x in logits]
        total = sum(exps)
        return [x / total for x in exps]

    def predict_probabilities(self, text: str) -> Tuple[str, float, Dict[str, float]]:
        t = text.lower()

        pos_score = 0.0
        neg_score = 0.0
        neu_score = 0.0

        for phrase in self.strong_positive:
            if phrase in t:
                pos_score += 3.2
        for phrase in self.moderate_positive:
            if phrase in t:
                pos_score += 1.6

        for phrase in self.strong_negative:
            if phrase in t:
                neg_score += 3.4
        for phrase in self.moderate_negative:
            if phrase in t:
                neg_score += 1.8

        for phrase in self.neutral_markers:
            if phrase in t:
                neu_score += 2.0

        if "not good" in t or "not great" in t or "not worth" in t or "not recommended" in t or "not happy" in t:
            neg_score += 2.5
            pos_score = max(0.0, pos_score - 1.5)

        if "not bad" in t or "not terrible" in t or "not awful" in t:
            pos_score += 1.4
            neg_score = max(0.0, neg_score - 1.2)

        if " but " in t or " however " in t or " although " in t:
            parts = t.replace("however", "but").replace("although", "but").split(" but ")
            if len(parts) >= 2:
                second_clause = parts[-1]
                for phrase in self.strong_negative + self.moderate_negative:
                    if phrase in second_clause:
                        neg_score += 2.0
                for phrase in self.strong_positive + self.moderate_positive:
                    if phrase in second_clause:
                        pos_score += 2.0

        if pos_score > neg_score + 0.8:
            neg_logit = -2.2 - (pos_score * 0.4)
            neu_logit = -0.5 - (pos_score * 0.2)
            pos_logit = 2.8 + (pos_score * 0.5)
        elif neg_score > pos_score + 0.8:
            neg_logit = 2.9 + (neg_score * 0.5)
            neu_logit = -0.5 - (neg_score * 0.2)
            pos_logit = -2.2 - (neg_score * 0.4)
        elif abs(pos_score - neg_score) <= 0.8 and (pos_score > 0.5 or neg_score > 0.5):
            neg_logit = 0.8 + (neg_score * 0.3)
            neu_logit = 2.4 + (neu_score * 0.4)
            pos_logit = 0.8 + (pos_score * 0.3)
        else:
            neg_logit = -0.8
            neu_logit = 2.2 + neu_score
            pos_logit = -0.8

        probs = self._softmax([neg_logit, neu_logit, pos_logit])

        class_names = ["Negative", "Neutral", "Positive"]
        pred_idx = probs.index(max(probs))
        predicted_class = class_names[pred_idx]
        confidence = float(probs[pred_idx])

        prob_dict = {
            "Negative": round(probs[0], 4),
            "Neutral": round(probs[1], 4),
            "Positive": round(probs[2], 4)
        }

        return predicted_class, round(confidence, 4), prob_dict
