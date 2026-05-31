"""
Advanced Sentiment Analysis Service for EchoSense
Multi-language support, emotion classification, and enhanced analytics.
"""

import asyncio
import logging
from typing import Dict, List, Any, Optional
import random
from datetime import datetime

from .config import settings

logger = logging.getLogger(__name__)

# Try to import advanced NLP libraries, fall back to mock implementation
try:
    from langdetect import detect, DetectorFactory
    DetectorFactory.seed = 0  # For consistent language detection
    LANGUAGE_DETECTION_AVAILABLE = True
except ImportError:
    LANGUAGE_DETECTION_AVAILABLE = False
    logger.warning("Language detection not available")

# Disable translation for now due to httpcore version conflicts
TRANSLATION_AVAILABLE = False
logger.warning("Translation service disabled due to dependency conflicts")

try:
    import torch
    from transformers import AutoTokenizer, AutoModelForSequenceClassification, pipeline
    TRANSFORMERS_AVAILABLE = True
except ImportError:
    TRANSFORMERS_AVAILABLE = False
    logger.warning("Transformers not available")

ADVANCED_NLP_AVAILABLE = LANGUAGE_DETECTION_AVAILABLE and TRANSFORMERS_AVAILABLE


class AdvancedSentimentService:
    """Enhanced sentiment analysis with multi-language and emotion support."""
    
    def __init__(self):
        self.sentiment_model = None
        self.emotion_model = None
        self.translator = None
        self.device = None
        
    async def initialize(self):
        """Initialize advanced sentiment analysis models."""
        logger.info("Initializing Advanced Sentiment Analysis Service...")
        
        if not ADVANCED_NLP_AVAILABLE:
            logger.warning("Using mock advanced sentiment analysis")
            return
        
        try:
            # Initialize translator if available
            if TRANSLATION_AVAILABLE:
                self.translator = Translator()
                logger.info("Translation service initialized")
            else:
                self.translator = None
                logger.warning("Translation service not available")

            # Initialize transformers if available
            if TRANSFORMERS_AVAILABLE:
                # Determine device
                if settings.use_gpu and torch.cuda.is_available():
                    self.device = torch.device("cuda")
                    logger.info("Using GPU for advanced sentiment analysis")
                else:
                    self.device = torch.device("cpu")
                    logger.info("Using CPU for advanced sentiment analysis")

                # Load sentiment model
                sentiment_model_name = settings.sentiment_model
                self.sentiment_model = pipeline(
                    "sentiment-analysis",
                    model=sentiment_model_name,
                    device=0 if self.device.type == "cuda" else -1,
                    return_all_scores=True
                )

                # Load emotion classification model
                emotion_model_name = "j-hartmann/emotion-english-distilroberta-base"
                self.emotion_model = pipeline(
                    "text-classification",
                    model=emotion_model_name,
                    device=0 if self.device.type == "cuda" else -1,
                    return_all_scores=True
                )

                logger.info("Transformers models initialized")
            else:
                self.sentiment_model = None
                self.emotion_model = None
                logger.warning("Transformers not available, using mock implementation")

            logger.info("Advanced Sentiment Analysis Service initialized successfully")
            
        except Exception as e:
            logger.error(f"Failed to initialize Advanced Sentiment Analysis Service: {e}")
            logger.warning("Falling back to mock implementation")
            self.sentiment_model = None
            self.emotion_model = None
            self.translator = None
    
    async def analyze_with_language_and_emotion(self, text: str) -> Dict[str, Any]:
        """Comprehensive analysis including language detection, translation, sentiment, and emotion."""
        try:
            # Detect language
            language = await self.detect_language(text)
            
            # Translate if not English
            translated_text = text
            if language != 'en':
                translated_text = await self.translate_to_english(text, language)
            
            # Analyze sentiment
            sentiment_result = await self.analyze_sentiment(translated_text)
            
            # Analyze emotions
            emotion_result = await self.analyze_emotions(translated_text)
            
            return {
                'original_text': text,
                'translated_text': translated_text if language != 'en' else None,
                'language': language,
                'sentiment': sentiment_result['sentiment'],
                'sentiment_confidence': sentiment_result['confidence'],
                'sentiment_scores': sentiment_result['all_scores'],
                'emotions': emotion_result['emotions'],
                'dominant_emotion': emotion_result['dominant_emotion'],
                'emotion_confidence': emotion_result['confidence']
            }
            
        except Exception as e:
            logger.error(f"Error in comprehensive analysis: {e}")
            return await self.mock_comprehensive_analysis(text)
    
    async def detect_language(self, text: str) -> str:
        """Detect the language of the text."""
        if not LANGUAGE_DETECTION_AVAILABLE or not text.strip():
            return self._mock_detect_language(text)

        try:
            # Use langdetect for language detection
            detected = detect(text)
            return detected
        except Exception as e:
            logger.error(f"Language detection failed: {e}")
            return self._mock_detect_language(text)
    
    async def translate_to_english(self, text: str, source_language: str) -> str:
        """Translate text to English."""
        if not TRANSLATION_AVAILABLE or not self.translator:
            return text  # Return original text as fallback

        try:
            # Use Google Translate
            result = self.translator.translate(text, src=source_language, dest='en')
            return result.text
        except Exception as e:
            logger.error(f"Translation failed: {e}")
            return text
    
    async def analyze_sentiment(self, text: str) -> Dict[str, Any]:
        """Analyze sentiment of the text."""
        if not TRANSFORMERS_AVAILABLE or not self.sentiment_model:
            return self._mock_sentiment_analysis(text)
        
        try:
            results = await asyncio.get_event_loop().run_in_executor(
                None, self.sentiment_model, text
            )
            
            # Process results
            sentiment_scores = {result['label'].lower(): result['score'] for result in results[0]}
            
            # Map labels to standard format
            label_mapping = {
                'positive': 'positive',
                'negative': 'negative',
                'neutral': 'neutral',
                'label_1': 'negative',
                'label_0': 'positive'
            }
            
            max_score = 0
            predicted_sentiment = 'neutral'
            confidence = 0.0
            
            for label, score in sentiment_scores.items():
                mapped_label = label_mapping.get(label.lower(), label.lower())
                if score > max_score:
                    max_score = score
                    predicted_sentiment = mapped_label
                    confidence = score
            
            return {
                'sentiment': predicted_sentiment,
                'confidence': float(confidence),
                'all_scores': {k: float(v) for k, v in sentiment_scores.items()}
            }
            
        except Exception as e:
            logger.error(f"Sentiment analysis failed: {e}")
            return self._mock_sentiment_analysis(text)
    
    async def analyze_emotions(self, text: str) -> Dict[str, Any]:
        """Analyze emotions in the text."""
        if not TRANSFORMERS_AVAILABLE or not self.emotion_model:
            return self._mock_emotion_analysis(text)
        
        try:
            results = await asyncio.get_event_loop().run_in_executor(
                None, self.emotion_model, text
            )
            
            # Process emotion results
            emotions = {}
            max_score = 0
            dominant_emotion = 'neutral'
            
            for result in results[0]:
                emotion = result['label'].lower()
                score = result['score']
                emotions[emotion] = float(score)
                
                if score > max_score:
                    max_score = score
                    dominant_emotion = emotion
            
            return {
                'emotions': emotions,
                'dominant_emotion': dominant_emotion,
                'confidence': float(max_score)
            }
            
        except Exception as e:
            logger.error(f"Emotion analysis failed: {e}")
            return self._mock_emotion_analysis(text)
    
    def _mock_detect_language(self, text: str) -> str:
        """Mock language detection for demo purposes."""
        text_lower = text.lower()
        
        # Simple keyword-based language detection
        if any(word in text_lower for word in ['el', 'la', 'de', 'que', 'y', 'en', 'un', 'es']):
            return 'es'
        elif any(word in text_lower for word in ['le', 'de', 'et', 'à', 'un', 'il', 'être']):
            return 'fr'
        elif any(word in text_lower for word in ['der', 'die', 'und', 'in', 'den', 'von', 'zu']):
            return 'de'
        else:
            return 'en'
    
    def _mock_sentiment_analysis(self, text: str) -> Dict[str, Any]:
        """Mock sentiment analysis."""
        text_lower = text.lower()
        
        positive_words = ['good', 'great', 'excellent', 'amazing', 'love', 'fantastic', 'awesome', 'perfect']
        negative_words = ['bad', 'terrible', 'awful', 'hate', 'horrible', 'worst', 'disappointing', 'broken']
        
        positive_count = sum(1 for word in positive_words if word in text_lower)
        negative_count = sum(1 for word in negative_words if word in text_lower)
        
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
            'all_scores': {sentiment: confidence}
        }
    
    def _mock_emotion_analysis(self, text: str) -> Dict[str, Any]:
        """Mock emotion analysis."""
        # Generate realistic emotion distribution
        emotions = ['joy', 'sadness', 'anger', 'fear', 'surprise', 'disgust']
        
        # Base the dominant emotion on sentiment keywords
        text_lower = text.lower()
        
        if any(word in text_lower for word in ['happy', 'great', 'love', 'excellent']):
            dominant = 'joy'
        elif any(word in text_lower for word in ['sad', 'disappointed', 'terrible']):
            dominant = 'sadness'
        elif any(word in text_lower for word in ['angry', 'hate', 'furious']):
            dominant = 'anger'
        elif any(word in text_lower for word in ['scared', 'worried', 'afraid']):
            dominant = 'fear'
        elif any(word in text_lower for word in ['wow', 'amazing', 'incredible']):
            dominant = 'surprise'
        else:
            dominant = random.choice(emotions)
        
        # Generate emotion scores
        emotion_scores = {}
        for emotion in emotions:
            if emotion == dominant:
                emotion_scores[emotion] = random.uniform(0.6, 0.9)
            else:
                emotion_scores[emotion] = random.uniform(0.05, 0.3)
        
        return {
            'emotions': emotion_scores,
            'dominant_emotion': dominant,
            'confidence': emotion_scores[dominant]
        }
    
    async def mock_comprehensive_analysis(self, text: str) -> Dict[str, Any]:
        """Mock comprehensive analysis for fallback."""
        language = self._mock_detect_language(text)
        sentiment_result = self._mock_sentiment_analysis(text)
        emotion_result = self._mock_emotion_analysis(text)
        
        return {
            'original_text': text,
            'translated_text': None if language == 'en' else 'Mock translation',
            'language': language,
            'sentiment': sentiment_result['sentiment'],
            'sentiment_confidence': sentiment_result['confidence'],
            'sentiment_scores': sentiment_result['all_scores'],
            'emotions': emotion_result['emotions'],
            'dominant_emotion': emotion_result['dominant_emotion'],
            'emotion_confidence': emotion_result['confidence']
        }
    
    async def cleanup(self):
        """Cleanup resources."""
        self.sentiment_model = None
        self.emotion_model = None
        self.translator = None
        logger.info("Advanced Sentiment Analysis Service cleaned up")
