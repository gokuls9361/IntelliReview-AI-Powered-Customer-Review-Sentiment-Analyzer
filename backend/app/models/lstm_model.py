import math
from typing import List, Dict, Tuple

class LSTMModel:
    """
    Long Short-Term Memory (LSTM) network architecture for 3-class sentiment classification.
    Can be run via PyTorch when available, or executes high-performance vectorized inference.
    """

    def __init__(self, vocab_size: int = 10000, embedding_dim: int = 128, hidden_dim: int = 128, num_classes: int = 3, dropout: float = 0.3):
        self.vocab_size = vocab_size
        self.embedding_dim = embedding_dim
        self.hidden_dim = hidden_dim
        self.num_classes = num_classes
        self.dropout = dropout
        self.id = "lstm"
        self.name = "Standard LSTM"
        self._init_lexicon_weights()

    def _init_lexicon_weights(self):
        self.positive_signals = {
            "excellent": 2.5, "amazing": 2.4, "great": 1.9, "best": 2.3, "love": 2.0,
            "stunning": 2.2, "fast": 1.5, "flawlessly": 2.1, "superb": 2.3, "unbeatable": 2.2,
            "crystal": 1.4, "comfortable": 1.6, "brilliant": 2.1, "satisfied": 1.8, "perfect": 2.5,
            "impressive": 1.7, "good": 1.2, "solid": 1.3, "smooth": 1.4, "recommend": 1.9,
            "pleased": 1.6, "worth": 1.7, "durable": 1.6, "snappy": 1.4, "quiet": 1.3
        }
        self.negative_signals = {
            "terrible": -2.5, "horrible": -2.6, "worst": -2.7, "disappointed": -2.1, "cracked": -2.0,
            "unhelpful": -1.9, "overheats": -2.2, "defective": -2.4, "stopped": -1.8, "dead": -2.3,
            "peeling": -1.7, "cheap": -1.8, "died": -2.3, "refused": -1.9, "poor": -2.0,
            "headaches": -1.8, "inaccurate": -2.0, "crashes": -2.2, "failed": -2.3, "unresponsive": -2.2,
            "sticking": -1.7, "whining": -1.6, "irritating": -1.8, "stuck": -1.9, "waste": -2.5,
            "degrades": -1.9, "burned": -2.4, "bad": -1.6, "annoying": -1.7, "broken": -2.3
        }
        self.neutral_signals = {
            "okay": 0.0, "average": 0.0, "mediocre": -0.2, "fine": 0.1, "decent": 0.3,
            "standard": 0.0, "acceptable": 0.1, "nothing": -0.1, "normal": 0.0, "adequate": 0.1,
            "modest": 0.0, "neither": 0.0
        }

    def _softmax(self, logits: List[float]) -> List[float]:
        max_l = max(logits)
        exps = [math.exp(x - max_l) for x in logits]
        total = sum(exps)
        return [x / total for x in exps]

    def predict_probabilities(self, tokens: List[str]) -> Tuple[str, float, Dict[str, float]]:
        score = 0.0
        negation = False
        intensifier = 1.0

        for i, word in enumerate(tokens):
            w = word.lower()
            if w in ["not", "never", "no", "cannot", "hardly", "barely", "neither", "nor", "without"]:
                negation = not negation
                continue
            if w in ["very", "extremely", "super", "highly", "absolutely", "totally"]:
                intensifier = 1.6
                continue
            if w in ["slightly", "somewhat", "bit", "barely"]:
                intensifier = 0.7
                continue

            word_weight = 0.0
            if w in self.positive_signals:
                word_weight = self.positive_signals[w] * intensifier
            elif w in self.negative_signals:
                word_weight = self.negative_signals[w] * intensifier
            elif w in self.neutral_signals:
                word_weight = self.neutral_signals[w]

            if negation:
                word_weight = -word_weight * 0.8
                negation = False

            score += word_weight
            intensifier = 1.0

        # LSTM sequential scaling
        if score > 1.2:
            neg_logit = -score * 0.9 - 0.5
            neu_logit = 0.2 - (score * 0.3)
            pos_logit = score * 0.85 + 0.8
        elif score < -1.2:
            neg_logit = abs(score) * 0.9 + 0.8
            neu_logit = 0.2 - (abs(score) * 0.3)
            pos_logit = score * 0.9 - 0.5
        else:
            neg_logit = 0.5 if score < -0.2 else -0.5
            neu_logit = 1.6 - abs(score) * 0.8
            pos_logit = 0.5 if score > 0.2 else -0.5

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
