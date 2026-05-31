"""
Data Ingestion Service for EchoSense
Handles data collection from Reddit, YouTube, and News APIs with concurrent processing.
"""

import asyncio
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
import hashlib
import json

import aiohttp
import asyncpraw
from googleapiclient.discovery import build
from newsapi import NewsApiClient
import sqlite3
import aiosqlite

from .config import settings

logger = logging.getLogger(__name__)


class DataIngestionService:
    """Service for collecting and managing data from multiple sources."""
    
    def __init__(self):
        self.reddit_client: Optional[asyncpraw.Reddit] = None
        self.youtube_client = None
        self.news_client: Optional[NewsApiClient] = None
        self.db_path = "echosense.db"
        self.session: Optional[aiohttp.ClientSession] = None
        
    async def initialize(self):
        """Initialize all data source clients and database."""
        logger.info("Initializing Data Ingestion Service...")
        
        try:
            # Initialize HTTP session
            self.session = aiohttp.ClientSession()
            
            # Initialize Reddit client
            self.reddit_client = asyncpraw.Reddit(
                client_id=settings.reddit_client_id,
                client_secret=settings.reddit_client_secret,
                user_agent=settings.reddit_user_agent,
                requestor_kwargs={"session": self.session}
            )
            
            # Initialize YouTube client (synchronous)
            self.youtube_client = build(
                'youtube', 'v3',
                developerKey=settings.youtube_api_key
            )
            
            # Initialize News API client
            self.news_client = NewsApiClient(api_key=settings.news_api_key)
            
            # Initialize database
            await self.init_database()
            
            logger.info("Data Ingestion Service initialized successfully")
            
        except Exception as e:
            logger.error(f"Failed to initialize Data Ingestion Service: {e}")
            raise
    
    async def init_database(self):
        """Initialize SQLite database with required tables."""
        async with aiosqlite.connect(self.db_path) as db:
            # Create posts table
            await db.execute("""
                CREATE TABLE IF NOT EXISTS posts (
                    id TEXT PRIMARY KEY,
                    source TEXT NOT NULL,
                    content TEXT NOT NULL,
                    url TEXT,
                    timestamp DATETIME NOT NULL,
                    sentiment TEXT,
                    confidence REAL,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    hash TEXT UNIQUE
                )
            """)
            
            # Create AI responses table
            await db.execute("""
                CREATE TABLE IF NOT EXISTS ai_responses (
                    id TEXT PRIMARY KEY,
                    response TEXT NOT NULL,
                    target_post_id TEXT,
                    quality_score REAL,
                    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (target_post_id) REFERENCES posts (id)
                )
            """)
            
            # Create indexes for better performance
            await db.execute("CREATE INDEX IF NOT EXISTS idx_posts_timestamp ON posts(timestamp)")
            await db.execute("CREATE INDEX IF NOT EXISTS idx_posts_sentiment ON posts(sentiment)")
            await db.execute("CREATE INDEX IF NOT EXISTS idx_posts_source ON posts(source)")

            await db.commit()

            # Insert demo data if the table is empty
            cursor = await db.execute("SELECT COUNT(*) FROM posts")
            count = (await cursor.fetchone())[0]

            if count == 0:
                await self.insert_demo_data(db)

    async def insert_demo_data(self, db):
        """Insert demo data for testing purposes."""
        from datetime import datetime, timedelta
        import uuid

        demo_posts = [
            {
                'id': str(uuid.uuid4()),
                'source': 'Reddit',
                'content': 'The new Tesla Model 3 is absolutely fantastic! The build quality has improved significantly.',
                'url': 'https://reddit.com/r/tesla/post1',
                'timestamp': datetime.utcnow() - timedelta(hours=1),
                'sentiment': 'positive',
                'confidence': 0.89,
                'hash': 'demo_hash_1'
            },
            {
                'id': str(uuid.uuid4()),
                'source': 'Twitter',
                'content': 'Tesla customer service was incredibly helpful today. Impressed with their response time!',
                'url': 'https://twitter.com/user/status1',
                'timestamp': datetime.utcnow() - timedelta(hours=2),
                'sentiment': 'positive',
                'confidence': 0.92,
                'hash': 'demo_hash_2'
            },
            {
                'id': str(uuid.uuid4()),
                'source': 'News',
                'content': 'Tesla reports mixed quarterly results as analysts watch the company closely.',
                'url': 'https://news.com/tesla-quarterly',
                'timestamp': datetime.utcnow() - timedelta(hours=3),
                'sentiment': 'neutral',
                'confidence': 0.75,
                'hash': 'demo_hash_3'
            },
            {
                'id': str(uuid.uuid4()),
                'source': 'Reddit',
                'content': 'I\'m disappointed with the latest Tesla update. Too many bugs and issues.',
                'url': 'https://reddit.com/r/tesla/post2',
                'timestamp': datetime.utcnow() - timedelta(hours=4),
                'sentiment': 'negative',
                'confidence': 0.84,
                'hash': 'demo_hash_4'
            },
            {
                'id': str(uuid.uuid4()),
                'source': 'YouTube',
                'content': 'Tesla Model Y review: Great performance but expensive for what you get.',
                'url': 'https://youtube.com/watch?v=demo',
                'timestamp': datetime.utcnow() - timedelta(hours=5),
                'sentiment': 'neutral',
                'confidence': 0.68,
                'hash': 'demo_hash_5'
            },
            {
                'id': str(uuid.uuid4()),
                'source': 'Twitter',
                'content': 'El nuevo Tesla es increíble, me encanta la tecnología!',
                'url': 'https://twitter.com/user/status2',
                'timestamp': datetime.utcnow() - timedelta(hours=6),
                'sentiment': 'positive',
                'confidence': 0.91,
                'hash': 'demo_hash_6'
            }
        ]

        for post in demo_posts:
            await db.execute("""
                INSERT INTO posts (id, source, content, url, timestamp, sentiment, confidence, hash)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                post['id'], post['source'], post['content'], post['url'],
                post['timestamp'], post['sentiment'], post['confidence'], post['hash']
            ))

        await db.commit()
        logger.info(f"Inserted {len(demo_posts)} demo posts")

    async def collect_all_sources(self) -> List[Dict[str, Any]]:
        """Collect data from all sources concurrently."""
        logger.info("Starting data collection from all sources...")
        
        tasks = [
            self.collect_reddit_data(),
            self.collect_youtube_data(),
            self.collect_news_data()
        ]
        
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        all_data = []
        for i, result in enumerate(results):
            source_name = ["Reddit", "YouTube", "News"][i]
            if isinstance(result, Exception):
                logger.error(f"Error collecting {source_name} data: {result}")
            else:
                all_data.extend(result)
                logger.info(f"Collected {len(result)} items from {source_name}")
        
        # Remove duplicates based on content hash
        unique_data = await self.deduplicate_data(all_data)
        logger.info(f"Total unique items collected: {len(unique_data)}")
        
        return unique_data
    
    async def collect_reddit_data(self) -> List[Dict[str, Any]]:
        """Collect data from Reddit."""
        if not self.reddit_client:
            return []
        
        posts = []
        try:
            for subreddit_name in settings.subreddits_list:
                subreddit = await self.reddit_client.subreddit(subreddit_name)
                
                # Get hot posts
                async for submission in subreddit.hot(limit=settings.max_posts_per_source // len(settings.subreddits_list)):
                    # Check if post mentions target brands
                    if any(brand.lower() in submission.title.lower() or 
                          brand.lower() in submission.selftext.lower() 
                          for brand in settings.target_brands_list):
                        
                        posts.append({
                            'id': f"reddit_{submission.id}",
                            'source': 'Reddit',
                            'content': f"{submission.title}\n{submission.selftext}",
                            'url': f"https://reddit.com{submission.permalink}",
                            'timestamp': datetime.fromtimestamp(submission.created_utc),
                            'raw_data': {
                                'subreddit': subreddit_name,
                                'score': submission.score,
                                'num_comments': submission.num_comments
                            }
                        })
                
        except Exception as e:
            logger.error(f"Error collecting Reddit data: {e}")
        
        return posts
    
    async def collect_youtube_data(self) -> List[Dict[str, Any]]:
        """Collect data from YouTube."""
        if not self.youtube_client:
            return []
        
        posts = []
        try:
            # Search for videos related to target brands
            for brand in settings.target_brands_list:
                search_response = self.youtube_client.search().list(
                    q=brand,
                    part='id,snippet',
                    maxResults=settings.max_posts_per_source // len(settings.target_brands_list),
                    order='relevance',
                    publishedAfter=(datetime.utcnow() - timedelta(days=7)).isoformat() + 'Z'
                ).execute()
                
                for item in search_response.get('items', []):
                    if item['id']['kind'] == 'youtube#video':
                        video_id = item['id']['videoId']
                        snippet = item['snippet']
                        
                        posts.append({
                            'id': f"youtube_{video_id}",
                            'source': 'YouTube',
                            'content': f"{snippet['title']}\n{snippet['description']}",
                            'url': f"https://www.youtube.com/watch?v={video_id}",
                            'timestamp': datetime.fromisoformat(snippet['publishedAt'].replace('Z', '+00:00')),
                            'raw_data': {
                                'channel': snippet['channelTitle'],
                                'channel_id': snippet['channelId']
                            }
                        })
                        
        except Exception as e:
            logger.error(f"Error collecting YouTube data: {e}")
        
        return posts
    
    async def collect_news_data(self) -> List[Dict[str, Any]]:
        """Collect data from News API."""
        if not self.news_client:
            return []
        
        posts = []
        try:
            # Search for news articles
            for keyword in settings.news_keywords_list:
                articles = self.news_client.get_everything(
                    q=keyword,
                    language='en',
                    sort_by='publishedAt',
                    page_size=settings.max_posts_per_source // len(settings.news_keywords_list),
                    from_param=(datetime.utcnow() - timedelta(days=7)).isoformat()
                )
                
                for article in articles.get('articles', []):
                    if article['title'] and article['description']:
                        posts.append({
                            'id': f"news_{hashlib.md5(article['url'].encode()).hexdigest()[:12]}",
                            'source': 'News',
                            'content': f"{article['title']}\n{article['description']}",
                            'url': article['url'],
                            'timestamp': datetime.fromisoformat(article['publishedAt'].replace('Z', '+00:00')),
                            'raw_data': {
                                'source_name': article['source']['name'],
                                'author': article['author']
                            }
                        })
                        
        except Exception as e:
            logger.error(f"Error collecting News data: {e}")
        
        return posts
    
    async def deduplicate_data(self, data: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Remove duplicate posts based on content hash."""
        seen_hashes = set()
        unique_data = []
        
        for item in data:
            # Create hash of content
            content_hash = hashlib.md5(item['content'].encode()).hexdigest()
            item['hash'] = content_hash
            
            if content_hash not in seen_hashes:
                seen_hashes.add(content_hash)
                unique_data.append(item)
        
        return unique_data
    
    async def store_analyzed_data(self, analyzed_data: List[Dict[str, Any]]):
        """Store analyzed data in the database."""
        async with aiosqlite.connect(self.db_path) as db:
            for item in analyzed_data:
                try:
                    await db.execute("""
                        INSERT OR REPLACE INTO posts 
                        (id, source, content, url, timestamp, sentiment, confidence, hash)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                    """, (
                        item['id'],
                        item['source'],
                        item['content'],
                        item.get('url'),
                        item['timestamp'],
                        item.get('sentiment'),
                        item.get('confidence'),
                        item.get('hash')
                    ))
                except Exception as e:
                    logger.error(f"Error storing item {item['id']}: {e}")
            
            await db.commit()
    
    async def get_current_stats(self) -> Dict[str, Any]:
        """Get current sentiment statistics."""
        async with aiosqlite.connect(self.db_path) as db:
            # Get total mentions in last 24 hours
            cursor = await db.execute("""
                SELECT COUNT(*) FROM posts 
                WHERE timestamp > datetime('now', '-24 hours')
            """)
            total_mentions = (await cursor.fetchone())[0]
            
            # Get sentiment distribution
            cursor = await db.execute("""
                SELECT sentiment, COUNT(*) FROM posts 
                WHERE timestamp > datetime('now', '-24 hours') AND sentiment IS NOT NULL
                GROUP BY sentiment
            """)
            sentiment_counts = await cursor.fetchall()
            
            # Calculate percentages
            total_with_sentiment = sum(count for _, count in sentiment_counts)
            sentiment_stats = {'positive': 0, 'negative': 0, 'neutral': 0}
            
            if total_with_sentiment > 0:
                for sentiment, count in sentiment_counts:
                    if sentiment in sentiment_stats:
                        sentiment_stats[sentiment] = round((count / total_with_sentiment) * 100, 1)
            
            return {
                'total_mentions': total_mentions,
                'positive': sentiment_stats['positive'],
                'negative': sentiment_stats['negative'],
                'neutral': sentiment_stats['neutral'],
                'last_updated': datetime.utcnow()
            }
    
    async def get_recent_feed(self, limit: int = 20) -> List[Dict[str, Any]]:
        """Get recent posts for the feed."""
        async with aiosqlite.connect(self.db_path) as db:
            cursor = await db.execute("""
                SELECT id, source, content, url, timestamp, sentiment, confidence
                FROM posts
                WHERE sentiment IS NOT NULL
                ORDER BY timestamp DESC
                LIMIT ?
            """, (limit,))

            rows = await cursor.fetchall()

            feed_items = []
            for row in rows:
                feed_items.append({
                    'id': row[0],
                    'source': row[1],
                    'text': row[2][:200] + '...' if len(row[2]) > 200 else row[2],
                    'url': row[3],
                    'timestamp': datetime.fromisoformat(row[4]) if isinstance(row[4], str) else row[4],
                    'sentiment': row[5],
                    'confidence': row[6] or 0.0
                })

            return feed_items

    async def get_trend_data(self, hours: int = 24) -> Dict[str, Any]:
        """Get trend data for charts."""
        async with aiosqlite.connect(self.db_path) as db:
            # Get hourly sentiment counts
            cursor = await db.execute("""
                SELECT
                    strftime('%Y-%m-%d %H:00:00', timestamp) as hour,
                    sentiment,
                    COUNT(*) as count
                FROM posts
                WHERE timestamp > datetime('now', '-{} hours')
                AND sentiment IS NOT NULL
                GROUP BY hour, sentiment
                ORDER BY hour
            """.format(hours))

            rows = await cursor.fetchall()

            # Process data for chart format
            hours_data = {}
            for row in rows:
                hour = row[0]
                sentiment = row[1]
                count = row[2]

                if hour not in hours_data:
                    hours_data[hour] = {'positive': 0, 'negative': 0, 'neutral': 0}

                if sentiment in hours_data[hour]:
                    hours_data[hour][sentiment] = count

            # Create chart data
            sorted_hours = sorted(hours_data.keys())
            labels = [datetime.fromisoformat(h).strftime('%H:00') for h in sorted_hours[-7:]]  # Last 7 hours

            positive_data = [hours_data.get(h, {}).get('positive', 0) for h in sorted_hours[-7:]]
            negative_data = [hours_data.get(h, {}).get('negative', 0) for h in sorted_hours[-7:]]

            return {
                'labels': labels,
                'datasets': [
                    {
                        'label': 'Positive',
                        'data': positive_data,
                        'borderColor': '#22c55e',
                        'backgroundColor': 'rgba(34, 197, 94, 0.1)',
                        'fill': True,
                        'tension': 0.4,
                    },
                    {
                        'label': 'Negative',
                        'data': negative_data,
                        'borderColor': '#ef4444',
                        'backgroundColor': 'rgba(239, 68, 68, 0.1)',
                        'fill': True,
                        'tension': 0.4,
                    },
                ]
            }

    async def get_negative_posts(self, limit: int = 5) -> List[Dict[str, Any]]:
        """Get recent negative sentiment posts for AI response generation."""
        async with aiosqlite.connect(self.db_path) as db:
            cursor = await db.execute("""
                SELECT id, source, content, url, timestamp, confidence
                FROM posts
                WHERE sentiment = 'negative'
                AND timestamp > datetime('now', '-24 hours')
                ORDER BY confidence DESC, timestamp DESC
                LIMIT ?
            """, (limit,))

            rows = await cursor.fetchall()

            posts = []
            for row in rows:
                posts.append({
                    'id': row[0],
                    'source': row[1],
                    'content': row[2],
                    'url': row[3],
                    'timestamp': datetime.fromisoformat(row[4]) if isinstance(row[4], str) else row[4],
                    'confidence': row[5] or 0.0
                })

            return posts

    async def cleanup(self):
        """Cleanup resources."""
        if self.session:
            await self.session.close()
        if self.reddit_client:
            await self.reddit_client.close()
