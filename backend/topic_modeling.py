"""
Topic Modeling Service for EchoSense
Extract trending topics and themes from brand mentions using BERTopic and KeyBERT.
"""

import asyncio
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional
import json
import aiosqlite
from collections import Counter

from .config import settings

logger = logging.getLogger(__name__)

# Try to import topic modeling libraries
try:
    from bertopic import BERTopic
    from keybert import KeyBERT
    from sklearn.feature_extraction.text import CountVectorizer
    TOPIC_MODELING_AVAILABLE = True
except ImportError:
    TOPIC_MODELING_AVAILABLE = False
    logger.warning("Topic modeling libraries not available, using mock implementation")


class TopicModelingService:
    """Service for extracting and analyzing topics from brand mentions."""
    
    def __init__(self):
        self.db_path = "echosense.db"
        self.topic_model = None
        self.keyword_model = None
        
    async def initialize(self):
        """Initialize topic modeling service."""
        logger.info("Initializing Topic Modeling Service...")
        
        try:
            await self.init_topics_database()
            
            if TOPIC_MODELING_AVAILABLE:
                # Initialize BERTopic model
                vectorizer_model = CountVectorizer(
                    ngram_range=(1, 2), 
                    stop_words="english",
                    min_df=2,
                    max_features=1000
                )
                
                self.topic_model = BERTopic(
                    vectorizer_model=vectorizer_model,
                    min_topic_size=3,
                    nr_topics="auto"
                )
                
                # Initialize KeyBERT for keyword extraction
                self.keyword_model = KeyBERT()
                
                logger.info("Topic modeling models initialized")
            else:
                logger.warning("Using mock topic modeling")
            
            logger.info("Topic Modeling Service initialized successfully")
            
        except Exception as e:
            logger.error(f"Failed to initialize Topic Modeling Service: {e}")
            logger.warning("Falling back to mock implementation")
            self.topic_model = None
            self.keyword_model = None
    
    async def init_topics_database(self):
        """Initialize topics database tables."""
        async with aiosqlite.connect(self.db_path) as db:
            # Topics table
            await db.execute("""
                CREATE TABLE IF NOT EXISTS topics (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    topic_id INTEGER NOT NULL,
                    keywords TEXT NOT NULL,
                    representative_docs TEXT,
                    timestamp DATETIME NOT NULL,
                    doc_count INTEGER DEFAULT 0,
                    avg_sentiment REAL DEFAULT 0.0,
                    sentiment_distribution TEXT
                )
            """)
            
            # Topic assignments table
            await db.execute("""
                CREATE TABLE IF NOT EXISTS post_topics (
                    post_id TEXT NOT NULL,
                    topic_id INTEGER NOT NULL,
                    confidence REAL DEFAULT 0.0,
                    timestamp DATETIME NOT NULL,
                    PRIMARY KEY (post_id, topic_id),
                    FOREIGN KEY (post_id) REFERENCES posts (id)
                )
            """)
            
            await db.execute("CREATE INDEX IF NOT EXISTS idx_topics_timestamp ON topics(timestamp)")
            await db.execute("CREATE INDEX IF NOT EXISTS idx_post_topics_topic_id ON post_topics(topic_id)")
            
            await db.commit()
    
    async def extract_topics(self, time_window_hours: int = 24) -> Dict[str, Any]:
        """Extract topics from recent posts."""
        try:
            # Get recent posts
            posts = await self.get_recent_posts(time_window_hours)
            
            if len(posts) < 10:  # Not enough data for topic modeling
                logger.warning("Not enough posts for topic modeling")
                return await self.mock_topic_extraction(posts)
            
            if not TOPIC_MODELING_AVAILABLE or not self.topic_model:
                return await self.mock_topic_extraction(posts)
            
            # Extract text content
            documents = [post['content'] for post in posts]
            
            # Fit topic model
            topics, probabilities = await asyncio.get_event_loop().run_in_executor(
                None, self.topic_model.fit_transform, documents
            )
            
            # Get topic information
            topic_info = self.topic_model.get_topic_info()
            
            # Process topics
            extracted_topics = []
            for _, row in topic_info.iterrows():
                if row['Topic'] == -1:  # Skip outlier topic
                    continue
                
                topic_id = int(row['Topic'])
                keywords = self.topic_model.get_topic(topic_id)
                
                # Get posts assigned to this topic
                topic_posts = [posts[i] for i, t in enumerate(topics) if t == topic_id]
                
                # Calculate sentiment distribution for this topic
                sentiment_dist = self.calculate_topic_sentiment(topic_posts)
                
                extracted_topics.append({
                    'topic_id': topic_id,
                    'keywords': [word for word, _ in keywords[:10]],  # Top 10 keywords
                    'keyword_scores': dict(keywords[:10]),
                    'doc_count': len(topic_posts),
                    'avg_sentiment': sentiment_dist['avg_sentiment'],
                    'sentiment_distribution': sentiment_dist['distribution'],
                    'representative_docs': [post['content'][:200] for post in topic_posts[:3]]
                })
            
            # Store topics in database
            await self.store_topics(extracted_topics)
            
            return {
                'topics': extracted_topics,
                'total_documents': len(documents),
                'num_topics': len(extracted_topics),
                'timestamp': datetime.utcnow()
            }
            
        except Exception as e:
            logger.error(f"Error extracting topics: {e}")
            return await self.mock_topic_extraction([])
    
    async def get_recent_posts(self, hours: int) -> List[Dict[str, Any]]:
        """Get recent posts for topic modeling."""
        async with aiosqlite.connect(self.db_path) as db:
            since = datetime.utcnow() - timedelta(hours=hours)
            cursor = await db.execute("""
                SELECT id, content, sentiment, timestamp
                FROM posts 
                WHERE timestamp > ? AND content IS NOT NULL
                ORDER BY timestamp DESC
            """, (since,))
            
            rows = await cursor.fetchall()
            
            posts = []
            for row in rows:
                posts.append({
                    'id': row[0],
                    'content': row[1],
                    'sentiment': row[2],
                    'timestamp': datetime.fromisoformat(row[3]) if isinstance(row[3], str) else row[3]
                })
            
            return posts
    
    def calculate_topic_sentiment(self, posts: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Calculate sentiment distribution for a topic."""
        if not posts:
            return {'avg_sentiment': 0.0, 'distribution': {'positive': 0, 'negative': 0, 'neutral': 0}}
        
        sentiments = [post['sentiment'] for post in posts if post['sentiment']]
        
        if not sentiments:
            return {'avg_sentiment': 0.0, 'distribution': {'positive': 0, 'negative': 0, 'neutral': 0}}
        
        # Count sentiment distribution
        sentiment_counts = Counter(sentiments)
        total = len(sentiments)
        
        distribution = {
            'positive': (sentiment_counts.get('positive', 0) / total) * 100,
            'negative': (sentiment_counts.get('negative', 0) / total) * 100,
            'neutral': (sentiment_counts.get('neutral', 0) / total) * 100
        }
        
        # Calculate average sentiment score
        sentiment_scores = {'positive': 1, 'neutral': 0, 'negative': -1}
        avg_sentiment = sum(sentiment_scores.get(s, 0) for s in sentiments) / len(sentiments)
        
        return {
            'avg_sentiment': avg_sentiment,
            'distribution': distribution
        }
    
    async def store_topics(self, topics: List[Dict[str, Any]]):
        """Store extracted topics in database."""
        async with aiosqlite.connect(self.db_path) as db:
            timestamp = datetime.utcnow()
            
            for topic in topics:
                await db.execute("""
                    INSERT INTO topics 
                    (topic_id, keywords, representative_docs, timestamp, doc_count, avg_sentiment, sentiment_distribution)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                """, (
                    topic['topic_id'],
                    json.dumps(topic['keywords']),
                    json.dumps(topic['representative_docs']),
                    timestamp,
                    topic['doc_count'],
                    topic['avg_sentiment'],
                    json.dumps(topic['sentiment_distribution'])
                ))
            
            await db.commit()
    
    async def get_trending_topics(self, limit: int = 10) -> List[Dict[str, Any]]:
        """Get current trending topics."""
        async with aiosqlite.connect(self.db_path) as db:
            # Get topics from last 24 hours
            since = datetime.utcnow() - timedelta(hours=24)
            cursor = await db.execute("""
                SELECT topic_id, keywords, doc_count, avg_sentiment, sentiment_distribution, timestamp
                FROM topics 
                WHERE timestamp > ?
                ORDER BY doc_count DESC, timestamp DESC
                LIMIT ?
            """, (since, limit))
            
            rows = await cursor.fetchall()
            
            topics = []
            for row in rows:
                topics.append({
                    'topic_id': row[0],
                    'keywords': json.loads(row[1]),
                    'doc_count': row[2],
                    'avg_sentiment': row[3],
                    'sentiment_distribution': json.loads(row[4]),
                    'timestamp': datetime.fromisoformat(row[5]) if isinstance(row[5], str) else row[5]
                })
            
            return topics
    
    async def mock_topic_extraction(self, posts: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Mock topic extraction for demo purposes."""
        mock_topics = [
            {
                'topic_id': 0,
                'keywords': ['product', 'quality', 'features', 'design', 'innovation'],
                'keyword_scores': {'product': 0.8, 'quality': 0.7, 'features': 0.6, 'design': 0.5, 'innovation': 0.4},
                'doc_count': max(1, len(posts) // 3),
                'avg_sentiment': 0.3,
                'sentiment_distribution': {'positive': 60, 'negative': 20, 'neutral': 20},
                'representative_docs': ['Great product with amazing features', 'The design is innovative', 'Quality is outstanding']
            },
            {
                'topic_id': 1,
                'keywords': ['customer', 'service', 'support', 'help', 'experience'],
                'keyword_scores': {'customer': 0.9, 'service': 0.8, 'support': 0.7, 'help': 0.6, 'experience': 0.5},
                'doc_count': max(1, len(posts) // 4),
                'avg_sentiment': -0.1,
                'sentiment_distribution': {'positive': 40, 'negative': 35, 'neutral': 25},
                'representative_docs': ['Customer service was helpful', 'Support team responded quickly', 'Mixed experience overall']
            },
            {
                'topic_id': 2,
                'keywords': ['price', 'cost', 'value', 'expensive', 'affordable'],
                'keyword_scores': {'price': 0.8, 'cost': 0.7, 'value': 0.6, 'expensive': 0.5, 'affordable': 0.4},
                'doc_count': max(1, len(posts) // 5),
                'avg_sentiment': -0.2,
                'sentiment_distribution': {'positive': 30, 'negative': 45, 'neutral': 25},
                'representative_docs': ['Too expensive for what it offers', 'Good value for money', 'Price is reasonable']
            }
        ]
        
        return {
            'topics': mock_topics,
            'total_documents': len(posts),
            'num_topics': len(mock_topics),
            'timestamp': datetime.utcnow()
        }
    
    async def cleanup(self):
        """Cleanup resources."""
        self.topic_model = None
        self.keyword_model = None
        logger.info("Topic Modeling Service cleaned up")
