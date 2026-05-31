"""
Crisis Detection Service for EchoSense
Real-time anomaly detection and alert system for brand perception monitoring.
"""

import asyncio
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional
import statistics
import uuid
import aiosqlite

from .config import settings

logger = logging.getLogger(__name__)


class CrisisDetectionService:
    """Service for detecting brand perception crises and anomalies."""
    
    def __init__(self):
        self.db_path = "echosense.db"
        self.alert_thresholds = {
            'sentiment_spike': {
                'negative_threshold': -15.0,  # % change in negative sentiment
                'positive_threshold': 20.0,   # % change in positive sentiment
                'time_window': 2  # hours
            },
            'volume_surge': {
                'threshold_multiplier': 3.0,  # 3x normal volume
                'time_window': 1  # hours
            },
            'engagement_anomaly': {
                'threshold_multiplier': 2.5,  # 2.5x normal engagement
                'time_window': 1  # hours
            }
        }
        
    async def initialize(self):
        """Initialize crisis detection service."""
        logger.info("Initializing Crisis Detection Service...")
        
        try:
            await self.init_alerts_database()
            logger.info("Crisis Detection Service initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize Crisis Detection Service: {e}")
            raise
    
    async def init_alerts_database(self):
        """Initialize alerts database table."""
        async with aiosqlite.connect(self.db_path) as db:
            await db.execute("""
                CREATE TABLE IF NOT EXISTS alerts (
                    id TEXT PRIMARY KEY,
                    type TEXT NOT NULL,
                    severity TEXT NOT NULL,
                    title TEXT NOT NULL,
                    description TEXT NOT NULL,
                    timestamp DATETIME NOT NULL,
                    value REAL,
                    threshold REAL,
                    source TEXT,
                    acknowledged BOOLEAN DEFAULT FALSE,
                    resolved BOOLEAN DEFAULT FALSE,
                    metadata TEXT
                )
            """)
            
            await db.execute("CREATE INDEX IF NOT EXISTS idx_alerts_timestamp ON alerts(timestamp)")
            await db.execute("CREATE INDEX IF NOT EXISTS idx_alerts_severity ON alerts(severity)")
            await db.execute("CREATE INDEX IF NOT EXISTS idx_alerts_acknowledged ON alerts(acknowledged)")
            
            await db.commit()
    
    async def detect_anomalies(self) -> List[Dict[str, Any]]:
        """Detect various types of anomalies in brand perception data."""
        alerts = []
        
        try:
            # Check for sentiment spikes
            sentiment_alerts = await self.detect_sentiment_anomalies()
            alerts.extend(sentiment_alerts)
            
            # Check for volume surges
            volume_alerts = await self.detect_volume_anomalies()
            alerts.extend(volume_alerts)
            
            # Check for engagement anomalies
            engagement_alerts = await self.detect_engagement_anomalies()
            alerts.extend(engagement_alerts)
            
            # Store new alerts
            for alert in alerts:
                await self.store_alert(alert)
            
            logger.info(f"Detected {len(alerts)} new anomalies")
            return alerts
            
        except Exception as e:
            logger.error(f"Error detecting anomalies: {e}")
            return []
    
    async def detect_sentiment_anomalies(self) -> List[Dict[str, Any]]:
        """Detect sudden changes in sentiment distribution."""
        alerts = []
        
        try:
            async with aiosqlite.connect(self.db_path) as db:
                # Get current sentiment distribution (last 2 hours)
                current_window = datetime.utcnow() - timedelta(hours=2)
                cursor = await db.execute("""
                    SELECT sentiment, COUNT(*) as count
                    FROM posts 
                    WHERE timestamp > ? AND sentiment IS NOT NULL
                    GROUP BY sentiment
                """, (current_window,))
                
                current_data = await cursor.fetchall()
                current_total = sum(count for _, count in current_data)
                
                if current_total < 10:  # Not enough data
                    return alerts
                
                current_distribution = {
                    sentiment: (count / current_total) * 100 
                    for sentiment, count in current_data
                }
                
                # Get baseline sentiment distribution (previous 24 hours, excluding last 2 hours)
                baseline_start = datetime.utcnow() - timedelta(hours=26)
                baseline_end = datetime.utcnow() - timedelta(hours=2)
                
                cursor = await db.execute("""
                    SELECT sentiment, COUNT(*) as count
                    FROM posts 
                    WHERE timestamp BETWEEN ? AND ? AND sentiment IS NOT NULL
                    GROUP BY sentiment
                """, (baseline_start, baseline_end))
                
                baseline_data = await cursor.fetchall()
                baseline_total = sum(count for _, count in baseline_data)
                
                if baseline_total < 50:  # Not enough baseline data
                    return alerts
                
                baseline_distribution = {
                    sentiment: (count / baseline_total) * 100 
                    for sentiment, count in baseline_data
                }
                
                # Check for significant changes
                for sentiment in ['positive', 'negative', 'neutral']:
                    current_pct = current_distribution.get(sentiment, 0)
                    baseline_pct = baseline_distribution.get(sentiment, 0)
                    change = current_pct - baseline_pct
                    
                    # Check for negative sentiment spike
                    if sentiment == 'negative' and change > self.alert_thresholds['sentiment_spike']['negative_threshold']:
                        alerts.append({
                            'id': str(uuid.uuid4()),
                            'type': 'sentiment_spike',
                            'severity': 'high' if change > 25 else 'medium',
                            'title': 'Negative Sentiment Spike Detected',
                            'description': f'Negative sentiment increased by {change:.1f}% in the last 2 hours',
                            'timestamp': datetime.utcnow(),
                            'value': change,
                            'threshold': self.alert_thresholds['sentiment_spike']['negative_threshold'],
                            'source': 'All Sources',
                            'metadata': {
                                'current_negative_pct': current_pct,
                                'baseline_negative_pct': baseline_pct,
                                'sample_size': current_total
                            }
                        })
                    
                    # Check for positive sentiment spike (good news!)
                    elif sentiment == 'positive' and change > self.alert_thresholds['sentiment_spike']['positive_threshold']:
                        alerts.append({
                            'id': str(uuid.uuid4()),
                            'type': 'sentiment_spike',
                            'severity': 'low',  # Positive spikes are good
                            'title': 'Positive Sentiment Surge Detected',
                            'description': f'Positive sentiment increased by {change:.1f}% in the last 2 hours',
                            'timestamp': datetime.utcnow(),
                            'value': change,
                            'threshold': self.alert_thresholds['sentiment_spike']['positive_threshold'],
                            'source': 'All Sources',
                            'metadata': {
                                'current_positive_pct': current_pct,
                                'baseline_positive_pct': baseline_pct,
                                'sample_size': current_total
                            }
                        })
                
        except Exception as e:
            logger.error(f"Error detecting sentiment anomalies: {e}")
        
        return alerts
    
    async def detect_volume_anomalies(self) -> List[Dict[str, Any]]:
        """Detect unusual spikes in mention volume."""
        alerts = []
        
        try:
            async with aiosqlite.connect(self.db_path) as db:
                # Get current hour volume
                current_hour = datetime.utcnow().replace(minute=0, second=0, microsecond=0)
                cursor = await db.execute("""
                    SELECT COUNT(*) FROM posts 
                    WHERE timestamp >= ?
                """, (current_hour,))
                
                current_volume = (await cursor.fetchone())[0]
                
                # Get average volume for same hour over past week
                past_week_volumes = []
                for i in range(1, 8):  # Last 7 days
                    past_hour = current_hour - timedelta(days=i)
                    cursor = await db.execute("""
                        SELECT COUNT(*) FROM posts 
                        WHERE timestamp BETWEEN ? AND ?
                    """, (past_hour, past_hour + timedelta(hours=1)))
                    
                    volume = (await cursor.fetchone())[0]
                    if volume > 0:
                        past_week_volumes.append(volume)
                
                if len(past_week_volumes) < 3:  # Not enough historical data
                    return alerts
                
                avg_volume = statistics.mean(past_week_volumes)
                threshold = avg_volume * self.alert_thresholds['volume_surge']['threshold_multiplier']
                
                if current_volume > threshold and current_volume > 10:  # Minimum volume threshold
                    multiplier = current_volume / avg_volume
                    alerts.append({
                        'id': str(uuid.uuid4()),
                        'type': 'volume_surge',
                        'severity': 'high' if multiplier > 5 else 'medium',
                        'title': 'Mention Volume Surge Detected',
                        'description': f'Brand mentions increased by {((multiplier - 1) * 100):.0f}% compared to average',
                        'timestamp': datetime.utcnow(),
                        'value': multiplier,
                        'threshold': self.alert_thresholds['volume_surge']['threshold_multiplier'],
                        'source': 'All Sources',
                        'metadata': {
                            'current_volume': current_volume,
                            'average_volume': avg_volume,
                            'historical_volumes': past_week_volumes
                        }
                    })
                
        except Exception as e:
            logger.error(f"Error detecting volume anomalies: {e}")
        
        return alerts
    
    async def detect_engagement_anomalies(self) -> List[Dict[str, Any]]:
        """Detect unusual engagement patterns (placeholder for future implementation)."""
        # This would analyze engagement metrics like comments, shares, likes
        # For now, return empty list as we don't have engagement data
        return []
    
    async def store_alert(self, alert: Dict[str, Any]):
        """Store alert in database."""
        async with aiosqlite.connect(self.db_path) as db:
            await db.execute("""
                INSERT INTO alerts 
                (id, type, severity, title, description, timestamp, value, threshold, source, metadata)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                alert['id'],
                alert['type'],
                alert['severity'],
                alert['title'],
                alert['description'],
                alert['timestamp'],
                alert.get('value'),
                alert.get('threshold'),
                alert.get('source'),
                str(alert.get('metadata', {}))
            ))
            await db.commit()
    
    async def get_active_alerts(self, limit: int = 10) -> List[Dict[str, Any]]:
        """Get active (unacknowledged) alerts."""
        async with aiosqlite.connect(self.db_path) as db:
            cursor = await db.execute("""
                SELECT id, type, severity, title, description, timestamp, value, threshold, source
                FROM alerts 
                WHERE acknowledged = FALSE
                ORDER BY timestamp DESC 
                LIMIT ?
            """, (limit,))
            
            rows = await cursor.fetchall()
            
            alerts = []
            for row in rows:
                alerts.append({
                    'id': row[0],
                    'type': row[1],
                    'severity': row[2],
                    'title': row[3],
                    'description': row[4],
                    'timestamp': datetime.fromisoformat(row[5]) if isinstance(row[5], str) else row[5],
                    'value': row[6],
                    'threshold': row[7],
                    'source': row[8]
                })
            
            return alerts
    
    async def acknowledge_alert(self, alert_id: str) -> bool:
        """Mark an alert as acknowledged."""
        async with aiosqlite.connect(self.db_path) as db:
            cursor = await db.execute("""
                UPDATE alerts SET acknowledged = TRUE 
                WHERE id = ?
            """, (alert_id,))
            await db.commit()
            return cursor.rowcount > 0
    
    async def cleanup(self):
        """Cleanup resources."""
        logger.info("Crisis Detection Service cleaned up")
