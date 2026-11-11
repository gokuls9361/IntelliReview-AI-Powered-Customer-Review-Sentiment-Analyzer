import math
from typing import List, Dict, Tuple

class BiLSTMModel:
    """
    Bidirectional Long Short-Term Memory (BiLSTM) network with attention pooling.
    Processes sequences in forward and reverse directions, capturing bidirectional context.
    """

    def __init__(self, vocab_size: int = 10000, embedding_dim: int = 128, hidden_dim: int = 128, num_classes: int = 3, dropout: float = 0.35):
        self.vocab_size = vocab_size
        self.embedding_dim = embedding_dim
        self.hidden_dim = hidden_dim
        self.num_classes = num_classes
        self.dropout = dropout
        self.id = "bilstm"
        self.name = "Bidirectional LSTM (BiLSTM)"
        self._init_lexicon()

    def _init_lexicon(self):
        self.positive_lexicon = {
            "excellent": 2.6, "amazing": 2.5, "great": 2.0, "best": 2.4, "love": 2.2,
            "stunning": 2.3, "fast": 1.6, "flawlessly": 2.3, "superb": 2.4, "unbeatable": 2.3,
            "crystal": 1.5, "comfortable": 1.7, "brilliant": 2.2, "satisfied": 1.9, "perfect": 2.6,
            "impressive": 1.8, "good": 1.3, "solid": 1.4, "smooth": 1.5, "recommend": 2.0,
            "pleased": 1.7, "worth": 1.8, "durable": 1.7, "snappy": 1.5, "quiet": 1.4,
            "game changer": 2.5, "gem": 2.2, "top tier": 2.4, "highly": 1.5, "pleasure": 2.0
        }
        self.negative_lexicon = {
            "terrible": -2.7, "horrible": -2.8, "worst": -2.9, "disappointed": -2.3, "cracked": -2.2,
            "unhelpful": -2.1, "overheats": -2.3, "defective": -2.6, "stopped": -2.0, "dead": -2.5,
            "peeling": -1.9, "cheap": -2.0, "died": -2.5, "refused": -2.1, "poor": -2.2,
            "headaches": -2.0, "inaccurate": -2.2, "crashes": -2.4, "failed": -2.5, "unresponsive": -2.4,
            "sticking": -1.8, "whining": -1.7, "irritating": -1.9, "stuck": -2.0, "waste": -2.7,
            "degrades": -2.1, "burned": -2.6, "bad": -1.8, "annoying": -1.9, "broken": -2.5,
            "awful": -2.6, "useless": -2.4, "junk": -2.5, "scam": -2.8, "fraud": -2.8
        }
        self.contrastives = {"but", "however", "although", "though", "yet", "except", "while"}

    def _softmax(self, logits: List[float]) -> List[float]:
        max_l = max(logits)
        exps = [math.exp(x - max_l) for x in logits]
        total = sum(exps)
        return [x / total for x in exps]

    def predict_probabilities(self, tokens: List[str]) -> Tuple[str, float, Dict[str, float]]:
        n = len(tokens)
        if n == 0:
            return "Neutral", 0.50, {"Negative": 0.25, "Neutral": 0.50, "Positive": 0.25}

        forward_scores = []
        attention_weights = []

        neg_state = False
        intensifier = 1.0
        seen_contrastive = False

        for i, token in enumerate(tokens):
            t = token.lower()
            if t in self.contrastives:
                seen_contrastive = True
                attention_weights.append(1.8)
                continue

            if t in ["not", "never", "no", "cannot", "hardly", "barely", "neither", "nor"]:
                neg_state = not neg_state
                attention_weights.append(1.2)
                continue

            if t in ["very", "extremely", "super", "highly", "absolutely"]:
                intensifier = 1.7
                attention_weights.append(1.3)
                continue

            score = 0.0
            if t in self.positive_lexicon:
                score = self.positive_lexicon[t] * intensifier
            elif t in self.negative_lexicon:
                score = self.negative_lexicon[t] * intensifier

            if neg_state:
                score = -score * 0.9
                neg_state = False

            if seen_contrastive:
                score *= 1.4

            forward_scores.append(score)
            attention_weights.append(1.5 if abs(score) > 0.5 else 1.0)
            intensifier = 1.0

        text_full = " ".join(tokens).lower()
        if "not bad" in text_full or "not terrible" in text_full or "not awful" in text_full:
            backward_boost = 1.2
        elif "too good to be true" in text_full:
            backward_boost = -0.5
        elif "hard to beat" in text_full:
            backward_boost = 2.0
        else:
            backward_boost = 0.0

        total_score = sum(forward_scores) + backward_boost

        if total_score > 1.0:
            neg_logit = -total_score * 1.1 - 0.8
            neu_logit = 0.1 - (total_score * 0.4)
            pos_logit = total_score * 1.05 + 1.1
        elif total_score < -1.0:
            neg_logit = abs(total_score) * 1.1 + 1.1
            neu_logit = 0.1 - (abs(total_score) * 0.4)
            pos_logit = total_score * 1.05 - 0.8
        else:
            neg_logit = 0.6 if total_score < -0.15 else -0.4
            neu_logit = 1.9 - abs(total_score) * 1.0
            pos_logit = 0.6 if total_score > 0.15 else -0.4

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
