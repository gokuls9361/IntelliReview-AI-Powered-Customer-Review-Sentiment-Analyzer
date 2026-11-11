import re
from typing import List, Dict, Any

class AspectBasedSentimentAnalyzer:
    """
    Aspect-Based Sentiment Analysis (ABSA) Engine.
    Deconstructs multi-faceted customer reviews into distinct product aspects
    and assigns sentiment polarity to each aspect individually.
    """

    def __init__(self):
        # Aspect definitions with domain keyword lexicons
        self.aspect_categories = {
            "Camera Quality": [
                "camera", "photo", "photos", "video", "videos", "lens", "zoom",
                "night mode", "picture", "pictures", "sensor", "4k", "megapixels", "megapixels"
            ],
            "Battery Life": [
                "battery", "charging", "charger", "charge", "backup", "drain", "power",
                "recharge", "lasts", "hours of battery", "standby"
            ],
            "Display & Screen": [
                "screen", "display", "oled", "retina", "120hz", "touchscreen", "panel",
                "colors", "brightness", "pixels", "glass", "touch"
            ],
            "Performance & Speed": [
                "performance", "processor", "speed", "fast", "snappy", "lag", "laggy",
                "slow", "gaming", "smooth", "freeze", "crash", "overheats", "heating"
            ],
            "Build & Design": [
                "build", "design", "chassis", "materials", "cushions", "strap", "aluminum",
                "heavy", "bulky", "lightweight", "cracked", "peeling", "water resistance", "durable"
            ],
            "Audio & Sound": [
                "sound", "audio", "bass", "treble", "speakers", "microphone", "mic",
                "noise cancellation", "stutter", "muffled", "volume", "music", "call"
            ],
            "Price & Value": [
                "price", "cost", "expensive", "cheap", "worth", "value", "overpriced",
                "penny", "deal", "affordable"
            ],
            "Customer Support & Service": [
                "customer support", "support", "customer service", "warranty", "refund",
                "replacement", "service", "company", "return policy"
            ],
            "Connectivity & App": [
                "bluetooth", "wi-fi", "wifi", "connection", "pairing", "app", "sync",
                "update", "bloatware", "software", "gps"
            ]
        }

        # Polarity keywords
        self.pos_words = {
            "excellent", "amazing", "great", "best", "good", "stunning", "fast", "unbeatable",
            "superb", "crystal", "comfortable", "brilliant", "satisfied", "perfect", "solid",
            "smooth", "recommend", "worth", "snappy", "quiet", "game changer", "flawless",
            "accurate", "snappy", "top", "impressive", "cleans", "flawlessly"
        }
        self.neg_words = {
            "terrible", "horrible", "worst", "disappointed", "cracked", "unhelpful", "overheats",
            "defective", "stopped", "dead", "peeling", "cheap", "died", "refused", "poor",
            "headaches", "inaccurate", "crashes", "failed", "unresponsive", "sticking", "whining",
            "irritating", "stuck", "waste", "degrades", "burned", "bad", "annoying", "broken",
            "muffled", "tight", "fogged", "struggles", "non-responsive"
        }
        self.neu_words = {
            "okay", "average", "mediocre", "decent", "fine", "standard", "acceptable", "normal"
        }

    def split_into_clauses(self, text: str) -> List[str]:
        """Splits review into functional clauses separated by punctuation or contrast conjunctions."""
        # Replace common contrastive conjunctions with split tokens
        delimited = re.sub(r'\b(but|however|although|though|while|whereas|yet|except)\b', '|', text, flags=re.IGNORECASE)
        # Split on sentence ends or delimiters
        raw_clauses = re.split(r'[.!?;,\n|]+', delimited)
        return [c.strip() for c in raw_clauses if len(c.strip()) > 3]

    def _determine_clause_sentiment(self, clause: str) -> str:
        """Calculates polarity of a single clause."""
        words = clause.lower().split()
        score = 0.0
        negated = False

        for w in words:
            if w in ["not", "never", "no", "cannot", "hardly", "barely", "lack", "without"]:
                negated = not negated
                continue
            
            if w in self.pos_words:
                score += -1.5 if negated else 1.5
                negated = False
            elif w in self.neg_words:
                score += 1.5 if negated else -1.5
                negated = False
            elif w in self.neu_words:
                score += 0.0

        if score >= 1.0:
            return "Positive"
        elif score <= -1.0:
            return "Negative"
        else:
            return "Neutral"

    def analyze(self, text: str) -> Dict[str, Any]:
        """
        Executes Aspect-Based Sentiment Analysis on review text.
        Returns:
            - aspects: List of detected aspects with polarity, snippet, and confidence.
            - overall_sentiment: Overall or 'Mixed' sentiment if aspects conflict.
        """
        clauses = self.split_into_clauses(text)
        detected_aspects = []
        aspect_sentiments = []

        for aspect_name, keywords in self.aspect_categories.items():
            matching_clause = None
            matched_kw = None

            # Check if any keyword of this aspect exists in any clause
            for clause in clauses:
                clause_lower = clause.lower()
                for kw in keywords:
                    if re.search(r'\b' + re.escape(kw) + r'\b', clause_lower):
                        matching_clause = clause
                        matched_kw = kw
                        break
                if matching_clause:
                    break

            # Fallback: check entire text if not isolated in a single clause
            if not matching_clause:
                text_lower = text.lower()
                for kw in keywords:
                    if re.search(r'\b' + re.escape(kw) + r'\b', text_lower):
                        matching_clause = text
                        matched_kw = kw
                        break

            if matching_clause:
                sentiment = self._determine_clause_sentiment(matching_clause)
                detected_aspects.append({
                    "aspect": aspect_name,
                    "keyword": matched_kw,
                    "sentiment": sentiment,
                    "evidence_snippet": matching_clause[:100] + ("..." if len(matching_clause) > 100 else "")
                })
                aspect_sentiments.append(sentiment)

        # Compute multi-aspect overall sentiment
        has_pos = "Positive" in aspect_sentiments
        has_neg = "Negative" in aspect_sentiments
        has_neu = "Neutral" in aspect_sentiments

        if has_pos and has_neg:
            overall = "Mixed"
        elif has_pos and not has_neg:
            overall = "Positive"
        elif has_neg and not has_pos:
            overall = "Negative"
        elif has_neu:
            overall = "Neutral"
        else:
            overall = "Neutral"

        return {
            "review_text": text,
            "detected_aspects": detected_aspects,
            "total_aspects_found": len(detected_aspects),
            "overall_aspect_sentiment": overall
        }
