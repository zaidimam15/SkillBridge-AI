"""
SkillBridge AI — NLP Preprocessor
Text cleaning and preprocessing for TF-IDF vectorization.
"""

import re
import string
from typing import List

try:
    import nltk
    from nltk.corpus import stopwords
    from nltk.tokenize import word_tokenize
    from nltk.stem import PorterStemmer, WordNetLemmatizer

    # Download required NLTK data (silent)
    for resource in ['stopwords', 'punkt', 'wordnet', 'punkt_tab']:
        try:
            nltk.download(resource, quiet=True)
        except Exception:
            pass

    NLTK_AVAILABLE = True
except ImportError:
    NLTK_AVAILABLE = False


# Custom stop words to preserve technical terms
TECHNICAL_PRESERVE = {
    'c', 'r', 'go', 'java', 'python', 'php', 'sql', 'css', 'html', 'aws',
    'api', 'rest', 'git', 'oop', 'mvc', 'api', 'orm', 'tdd', 'bdd', 'ci',
    'cd', 'ml', 'ai', 'nlp', 'db', 'os', 'vm', 'ui', 'ux', 'qa',
}

CUSTOM_STOP_WORDS = {
    'etc', 'including', 'using', 'used', 'use', 'working', 'work', 'good',
    'strong', 'excellent', 'knowledge', 'experience', 'understanding',
    'familiar', 'proficient', 'ability', 'able', 'various', 'related',
    'relevant', 'preferred', 'required', 'must', 'should', 'may', 'also',
    'well', 'like', 'looking', 'seeking', 'candidate', 'role', 'position',
    'team', 'join', 'year', 'years', 'month', 'months', 'day',
}


class NLPPreprocessor:
    """Preprocesses text for TF-IDF vectorization."""

    def __init__(self):
        if NLTK_AVAILABLE:
            try:
                self._stop_words = set(stopwords.words('english'))
            except Exception:
                self._stop_words = set()
        else:
            self._stop_words = set()

        # Remove technical terms from stop words
        self._stop_words -= TECHNICAL_PRESERVE
        # Add custom stop words
        self._stop_words |= CUSTOM_STOP_WORDS

        if NLTK_AVAILABLE:
            self._lemmatizer = WordNetLemmatizer()
            self._stemmer = PorterStemmer()

    def preprocess(self, text: str, use_lemmatize: bool = True) -> str:
        """
        Full preprocessing pipeline:
        1. Lowercase
        2. Remove URLs, emails, special chars
        3. Tokenize
        4. Remove stop words (preserve technical terms)
        5. Lemmatize/stem
        6. Rejoin
        """
        if not text:
            return ''

        # Lowercase
        text = text.lower()

        # Preserve important multi-word technical terms
        text = self._preserve_multi_word_skills(text)

        # Remove URLs
        text = re.sub(r'https?://\S+', '', text)

        # Remove emails
        text = re.sub(r'\S+@\S+', '', text)

        # Remove special characters (keep letters, digits, spaces, preserved underscores)
        text = re.sub(r'[^a-zA-Z0-9\s_]', ' ', text)

        # Tokenize
        if NLTK_AVAILABLE:
            try:
                tokens = word_tokenize(text)
            except Exception:
                tokens = text.split()
        else:
            tokens = text.split()

        # Filter
        processed = []
        for token in tokens:
            token = token.strip('_').strip()
            if not token or len(token) < 2:
                continue
            if token in self._stop_words:
                continue
            if token.isnumeric() and len(token) > 2:
                continue

            if use_lemmatize and NLTK_AVAILABLE:
                try:
                    token = self._lemmatizer.lemmatize(token)
                except Exception:
                    pass

            processed.append(token)

        return ' '.join(processed)

    def _preserve_multi_word_skills(self, text: str) -> str:
        """Replace multi-word skills with single underscore-joined tokens."""
        multi_word_map = {
            'machine learning': 'machine_learning',
            'deep learning': 'deep_learning',
            'natural language processing': 'natural_language_processing',
            'computer vision': 'computer_vision',
            'data science': 'data_science',
            'data analysis': 'data_analysis',
            'data analytics': 'data_analytics',
            'data structures': 'data_structures',
            'software engineering': 'software_engineering',
            'system design': 'system_design',
            'design patterns': 'design_patterns',
            'object oriented': 'object_oriented',
            'distributed systems': 'distributed_systems',
            'cloud computing': 'cloud_computing',
            'web development': 'web_development',
            'full stack': 'full_stack',
            'rest api': 'rest_api',
            'restful api': 'rest_api',
            'node js': 'node_js',
            'react js': 'react_js',
            'spring boot': 'spring_boot',
            'github actions': 'github_actions',
            'unit testing': 'unit_testing',
            'test driven': 'test_driven',
            'agile scrum': 'agile_scrum',
            'power bi': 'power_bi',
            'google cloud': 'google_cloud',
            'amazon web services': 'amazon_web_services',
            'microsoft azure': 'microsoft_azure',
            'docker compose': 'docker_compose',
        }
        for phrase, replacement in multi_word_map.items():
            text = text.replace(phrase, replacement)
        return text

    def extract_keywords(self, text: str, top_n: int = 30) -> List[str]:
        """Extract top keywords from text using simple frequency."""
        processed = self.preprocess(text)
        tokens = processed.split()
        freq = {}
        for token in tokens:
            if len(token) >= 3:
                freq[token] = freq.get(token, 0) + 1

        sorted_keywords = sorted(freq.items(), key=lambda x: x[1], reverse=True)
        return [k for k, v in sorted_keywords[:top_n]]

    def get_ngrams(self, text: str, n: int = 2) -> List[str]:
        """Generate n-grams from text."""
        tokens = text.lower().split()
        ngrams = []
        for i in range(len(tokens) - n + 1):
            ngram = ' '.join(tokens[i:i + n])
            ngrams.append(ngram)
        return ngrams
