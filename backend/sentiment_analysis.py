"""
Sentiment Analysis Service for EchoSense
Uses Hugging Face DistilBERT for advanced sentiment classification.
"""

import asyncio
import logging
from typing import Dict, List, Any, Optional
import random

from .config import settings

# Try to import ML libraries, fall back to mock implementation if not available
try:
    import torch
    from transformers import AutoTokenizer, AutoModelForSequenceClassification, pipeline
    import numpy as np
    ML_AVAILABLE = True
except ImportError:
    ML_AVAILABLE = False
    torch = None

logger = logging.getLogger(__name__)


class SentimentAnalysisService:
    """Service for analyzing sentiment using Hugging Face models."""
    
    def __init__(self):
        self.model = None
        self.tokenizer = None
        self.classifier = None
        self.device = None
        
    async def initialize(self):
        """Initialize the sentiment analysis model."""
        logger.info("Initializing Sentiment Analysis Service...")

        if not ML_AVAILABLE:
            logger.warning("ML libraries not available, using mock sentiment analysis")
            self.classifier = None
            return

        try:
            # Determine device (GPU if available and enabled)
            if settings.use_gpu and torch.cuda.is_available():
                self.device = torch.device("cuda")
                logger.info("Using GPU for sentiment analysis")
            else:
                self.device = torch.device("cpu")
                logger.info("Using CPU for sentiment analysis")

            # Load model and tokenizer
            model_name = settings.sentiment_model
            logger.info(f"Loading model: {model_name}")

            self.tokenizer = AutoTokenizer.from_pretrained(model_name)
            self.model = AutoModelForSequenceClassification.from_pretrained(model_name)

            # Move model to device
            self.model.to(self.device)

            # Create pipeline for easier inference
            self.classifier = pipeline(
                "sentiment-analysis",
                model=self.model,
                tokenizer=self.tokenizer,
                device=0 if self.device.type == "cuda" else -1,
                return_all_scores=True
            )

            logger.info("Sentiment Analysis Service initialized successfully")

        except Exception as e:
            logger.error(f"Failed to initialize Sentiment Analysis Service: {e}")
            logger.warning("Falling back to mock sentiment analysis")
            self.classifier = None
    
    async def analyze_single(self, text: str) -> Dict[str, Any]:
        """Analyze sentiment for a single text."""
        if not self.classifier:
            # Use mock sentiment analysis
            return self._mock_analyze_single(text)

        try:
            # Clean and truncate text
            cleaned_text = self._clean_text(text)

            # Run inference
            results = await asyncio.get_event_loop().run_in_executor(
                None, self._run_inference, cleaned_text
            )

            # Process results
            sentiment_scores = {result['label'].lower(): result['score'] for result in results[0]}

            # Map labels to our standard format
            label_mapping = {
                'positive': 'positive',
                'negative': 'negative',
                'neutral': 'neutral',
                'label_1': 'negative',  # DistilBERT uses LABEL_0/LABEL_1
                'label_0': 'positive'
            }

            # Find the highest confidence sentiment
            max_score = 0
            predicted_sentiment = 'neutral'
            confidence = 0.0

            for label, score in sentiment_scores.items():
                mapped_label = label_mapping.get(label.lower(), label.lower())
                if score > max_score:
                    max_score = score
                    predicted_sentiment = mapped_label
                    confidence = score

            # If using binary classification (positive/negative), add neutral logic
            if len(sentiment_scores) == 2 and confidence < 0.7:
                predicted_sentiment = 'neutral'
                confidence = 1.0 - confidence

            return {
                'sentiment': predicted_sentiment,
                'confidence': float(confidence),
                'all_scores': {k: float(v) for k, v in sentiment_scores.items()}
            }

        except Exception as e:
            logger.error(f"Error analyzing sentiment for text: {e}")
            # Return neutral sentiment as fallback
            return {
                'sentiment': 'neutral',
                'confidence': 0.5,
                'all_scores': {'neutral': 0.5}
            }

    def _mock_analyze_single(self, text: str) -> Dict[str, Any]:
        """Mock sentiment analysis for demo purposes with multi-language support."""
        # Detect language and analyze sentiment
        language = self._detect_language(text)
        text_lower = text.lower()

        # Multi-language sentiment keywords
        sentiment_keywords = {
            'en': {
                'positive': ['good', 'great', 'excellent', 'amazing', 'love', 'fantastic', 'awesome', 'perfect'],
                'negative': ['bad', 'terrible', 'awful', 'hate', 'horrible', 'worst', 'disappointing', 'broken']
            },
            'es': {
                'positive': ['bueno', 'excelente', 'increíble', 'amor', 'fantástico', 'perfecto'],
                'negative': ['malo', 'terrible', 'horrible', 'odio', 'peor', 'decepcionante']
            },
            'fr': {
                'positive': ['bon', 'excellent', 'incroyable', 'amour', 'fantastique', 'parfait'],
                'negative': ['mauvais', 'terrible', 'horrible', 'haine', 'pire', 'décevant']
            },
            'de': {
                'positive': ['gut', 'ausgezeichnet', 'erstaunlich', 'liebe', 'fantastisch', 'perfekt'],
                'negative': ['schlecht', 'schrecklich', 'hass', 'schlimmste', 'enttäuschend']
            }
        }

        # Use English as fallback
        keywords = sentiment_keywords.get(language, sentiment_keywords['en'])

        positive_count = sum(1 for word in keywords['positive'] if word in text_lower)
        negative_count = sum(1 for word in keywords['negative'] if word in text_lower)

        if positive_count > negative_count:
            sentiment = 'positive'
            confidence = min(0.9, 0.6 + (positive_count * 0.1))
        elif negative_count > positive_count:
            sentiment = 'negative'
            confidence = min(0.9, 0.6 + (negative_count * 0.1))
        else:
            sentiment = 'neutral'
            confidence = 0.7

        return {
            'sentiment': sentiment,
            'confidence': confidence,
            'language': language,
            'all_scores': {sentiment: confidence}
        }

    def _detect_language(self, text: str) -> str:
        """Simple language detection based on common words."""
        text_lower = text.lower()

        # Language indicators
        language_indicators = {
            'es': ['el', 'la', 'de', 'que', 'y', 'en', 'un', 'es', 'se', 'no', 'te', 'lo', 'le', 'da', 'su', 'por', 'son', 'con', 'para'],
            'fr': ['le', 'de', 'et', 'à', 'un', 'il', 'être', 'et', 'en', 'avoir', 'que', 'pour', 'dans', 'ce', 'son', 'une', 'sur', 'avec', 'ne', 'se'],
            'de': ['der', 'die', 'und', 'in', 'den', 'von', 'zu', 'das', 'mit', 'sich', 'des', 'auf', 'für', 'ist', 'im', 'dem', 'nicht', 'ein', 'eine', 'als'],
            'en': ['the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i', 'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at']
        }

        # Count matches for each language
        language_scores = {}
        words = text_lower.split()

        for lang, indicators in language_indicators.items():
            score = sum(1 for word in words if word in indicators)
            language_scores[lang] = score

        # Return language with highest score, default to English
        if language_scores:
            detected_lang = max(language_scores, key=language_scores.get)
            return detected_lang if language_scores[detected_lang] > 0 else 'en'

        return 'en'
    
    async def analyze_batch(self, data: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Analyze sentiment for a batch of data."""
        if not data:
            return []
        
        logger.info(f"Analyzing sentiment for {len(data)} items...")
        
        # Process in batches to avoid memory issues
        batch_size = settings.batch_size
        analyzed_data = []
        
        for i in range(0, len(data), batch_size):
            batch = data[i:i + batch_size]
            batch_results = await self._process_batch(batch)
            analyzed_data.extend(batch_results)
        
        logger.info(f"Completed sentiment analysis for {len(analyzed_data)} items")
        return analyzed_data
    
    async def _process_batch(self, batch: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Process a single batch of data."""
        tasks = []
        
        for item in batch:
            task = self.analyze_single(item['content'])
            tasks.append(task)
        
        # Run all analyses concurrently
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        # Combine results with original data
        analyzed_batch = []
        for i, (item, result) in enumerate(zip(batch, results)):
            if isinstance(result, Exception):
                logger.error(f"Error analyzing item {i}: {result}")
                # Use fallback sentiment
                result = {
                    'sentiment': 'neutral',
                    'confidence': 0.5,
                    'all_scores': {'neutral': 0.5}
                }
            
            # Add sentiment analysis results to the original item
            analyzed_item = item.copy()
            analyzed_item.update(result)
            analyzed_batch.append(analyzed_item)
        
        return analyzed_batch
    
    def _clean_text(self, text: str) -> str:
        """Clean and preprocess text for analysis."""
        if not text:
            return ""
        
        # Remove excessive whitespace
        text = ' '.join(text.split())
        
        # Truncate to model's maximum length (512 tokens for DistilBERT)
        # Approximate: 1 token ≈ 4 characters
        max_chars = 2000
        if len(text) > max_chars:
            text = text[:max_chars] + "..."
        
        return text
    
    def _run_inference(self, text: str) -> List[Dict[str, Any]]:
        """Run model inference (blocking operation)."""
        return self.classifier(text)
    
    async def get_sentiment_distribution(self, data: List[Dict[str, Any]]) -> Dict[str, float]:
        """Calculate sentiment distribution for a dataset."""
        if not data:
            return {'positive': 0.0, 'negative': 0.0, 'neutral': 0.0}
        
        sentiment_counts = {'positive': 0, 'negative': 0, 'neutral': 0}
        
        for item in data:
            sentiment = item.get('sentiment', 'neutral')
            if sentiment in sentiment_counts:
                sentiment_counts[sentiment] += 1
        
        total = len(data)
        return {
            sentiment: (count / total) * 100 
            for sentiment, count in sentiment_counts.items()
        }
    
    async def filter_by_sentiment(self, data: List[Dict[str, Any]], 
                                 sentiment: str, 
                                 min_confidence: float = 0.6) -> List[Dict[str, Any]]:
        """Filter data by sentiment and minimum confidence."""
        return [
            item for item in data
            if item.get('sentiment') == sentiment 
            and item.get('confidence', 0) >= min_confidence
        ]
    
    async def get_high_confidence_predictions(self, data: List[Dict[str, Any]], 
                                            min_confidence: float = 0.8) -> List[Dict[str, Any]]:
        """Get predictions with high confidence scores."""
        return [
            item for item in data
            if item.get('confidence', 0) >= min_confidence
        ]
    
    async def cleanup(self):
        """Cleanup resources."""
        # Clear model from memory
        if self.model:
            del self.model
        if self.tokenizer:
            del self.tokenizer
        if self.classifier:
            del self.classifier
        
        # Clear CUDA cache if using GPU
        if torch.cuda.is_available():
            torch.cuda.empty_cache()
        
        logger.info("Sentiment Analysis Service cleaned up")
