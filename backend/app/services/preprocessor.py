import re
import string
from typing import List, Dict

# Standard English contractions
CONTRACTIONS = {
    "ain't": "am not", "aren't": "are not", "can't": "cannot", "can't've": "cannot have",
    "'cause": "because", "could've": "could have", "couldn't": "could not",
    "didn't": "did not", "doesn't": "does not", "don't": "do not", "hadn't": "had not",
    "hasn't": "has not", "haven't": "have not", "he'd": "he would", "he'll": "he will",
    "he's": "he is", "how'd": "how did", "how'll": "how will", "how's": "how is",
    "i'd": "i would", "i'll": "i will", "i'm": "i am", "i've": "i have",
    "isn't": "is not", "it'd": "it would", "it'll": "it will", "it's": "it is",
    "let's": "let us", "mightn't": "might not", "mustn't": "must not",
    "shan't": "shall not", "she'd": "she would", "she'll": "she will",
    "she's": "she is", "shouldn't": "should not", "that's": "that is",
    "there's": "there is", "they'd": "they would", "they'll": "they will",
    "they're": "they are", "they've": "they have", "wasn't": "was not",
    "we'd": "we would", "we'll": "we will", "we're": "we are", "we've": "we have",
    "weren't": "were not", "won't": "will not", "wouldn't": "would not",
    "you'd": "you would", "you'll": "you will", "you're": "you are", "you've": "you have"
}

# Negation words that must NOT be removed in sentiment analysis
PRESERVED_NEGATIONS = {
    "not", "no", "never", "neither", "nor", "none", "hardly", "scarcely",
    "barely", "cannot", "without", "lack", "lacked", "lacks", "fail", "failed"
}

# General stopwords (excluding negations and sentiment modifiers)
BASE_STOPWORDS = {
    "a", "about", "above", "after", "again", "against", "all", "am", "an", "and",
    "any", "are", "as", "at", "be", "because", "been", "before", "being", "below",
    "between", "both", "by", "could", "did", "do", "does", "doing", "down",
    "during", "each", "few", "for", "from", "further", "had", "has", "have",
    "having", "he", "her", "here", "hers", "herself", "him", "himself", "his",
    "how", "i", "if", "in", "into", "is", "it", "its", "itself", "me", "more",
    "most", "my", "myself", "of", "off", "on", "once", "only", "or", "other",
    "ought", "our", "ours", "ourselves", "out", "over", "own", "same", "she",
    "should", "so", "some", "such", "than", "that", "the", "their", "theirs",
    "them", "themselves", "then", "there", "these", "they", "this", "those",
    "through", "to", "too", "under", "until", "up", "very", "was", "we", "were",
    "what", "when", "where", "which", "while", "who", "whom", "why", "with",
    "would", "you", "your", "yours", "yourself", "yourselves"
}

STOPWORDS = {word for word in BASE_STOPWORDS if word not in PRESERVED_NEGATIONS}


class TextPreprocessor:
    """Production NLP text preprocessor for sentiment analysis."""

    def __init__(self, vocab: Dict[str, int] = None, max_length: int = 128):
        self.vocab = vocab or {}
        self.max_length = max_length
        self.pad_token = "<PAD>"
        self.unk_token = "<UNK>"
        
        # Ensure special tokens exist in vocab
        if not self.vocab:
            self.vocab = {self.pad_token: 0, self.unk_token: 1}

    def expand_contractions(self, text: str) -> str:
        """Expands common English contractions."""
        pattern = re.compile(r'\b(' + '|'.join(re.escape(k) for k in CONTRACTIONS.keys()) + r')\b', re.IGNORECASE)
        def replace(match):
            key = match.group(0).lower()
            return CONTRACTIONS.get(key, key)
        return pattern.sub(replace, text)

    def clean_text(self, text: str, remove_stopwords: bool = False) -> str:
        """Full cleaning pipeline: strips HTML, URLs, special chars, normalizes spaces."""
        if not isinstance(text, str):
            return ""

        # Remove HTML tags
        text = re.sub(r'<.*?>', ' ', text)
        
        # Remove URLs
        text = re.sub(r'http\S+|www\.\S+', ' ', text)
        
        # Expand contractions
        text = self.expand_contractions(text)
        
        # Lowercase
        text = text.lower()
        
        # Replace emojis / emoticons with semantic tokens
        text = re.sub(r':\)|:-\)|:\^D|:D|<3', ' positive_emoticon ', text)
        text = re.sub(r':\(|:-\(|:c|:\'\(|:\'-\(', ' negative_emoticon ', text)

        # Replace non-alphanumeric (keep apostrophes if needed, but remove other punctuation)
        text = re.sub(r'[^a-zA-Z0-9\s_]', ' ', text)
        
        # Collapse multiple spaces
        text = re.sub(r'\s+', ' ', text).strip()

        if remove_stopwords:
            tokens = text.split()
            tokens = [t for t in tokens if t not in STOPWORDS or t in PRESERVED_NEGATIONS]
            text = " ".join(tokens)

        return text

    def tokenize(self, text: str) -> List[str]:
        """Splits cleaned text into tokens."""
        cleaned = self.clean_text(text, remove_stopwords=False)
        return cleaned.split()

    def build_vocab(self, texts: List[str], max_vocab_size: int = 10000, min_freq: int = 2):
        """Constructs vocabulary dictionary from a corpus."""
        freq: Dict[str, int] = {}
        for text in texts:
            for token in self.tokenize(text):
                freq[token] = freq.get(token, 0) + 1

        # Sort by frequency
        sorted_tokens = sorted(freq.items(), key=lambda x: x[1], reverse=True)
        
        self.vocab = {self.pad_token: 0, self.unk_token: 1}
        idx = 2
        for token, count in sorted_tokens:
            if count >= min_freq and idx < max_vocab_size:
                self.vocab[token] = idx
                idx += 1

        return self.vocab

    def text_to_sequence(self, text: str) -> List[int]:
        """Converts text string into a list of vocabulary token IDs."""
        tokens = self.tokenize(text)
        seq = [self.vocab.get(token, self.vocab.get(self.unk_token, 1)) for token in tokens]
        return seq

    def pad_sequence(self, sequence: List[int]) -> List[int]:
        """Pads or truncates sequence to self.max_length."""
        if len(sequence) >= self.max_length:
            return sequence[:self.max_length]
        else:
            return sequence + [self.vocab.get(self.pad_token, 0)] * (self.max_length - len(sequence))

    def prepare_input(self, text: str) -> List[int]:
        """End-to-end transformation from raw text to padded sequence."""
        seq = self.text_to_sequence(text)
        return self.pad_sequence(seq)
