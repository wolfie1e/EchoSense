"""
AI Agent Service for EchoSense
Uses LangChain with OpenAI GPT for generating context-aware brand responses.
"""

import asyncio
import logging
import uuid
from datetime import datetime
from typing import Dict, List, Any, Optional

import aiosqlite
from langchain.llms.openai import OpenAI
from langchain.prompts import PromptTemplate
from langchain.chains import LLMChain
from langchain.schema import BaseOutputParser
import openai

from .config import settings

logger = logging.getLogger(__name__)


class ResponseQualityParser(BaseOutputParser):
    """Parser for evaluating response quality."""
    
    def parse(self, text: str) -> Dict[str, Any]:
        """Parse the quality evaluation response."""
        try:
            # Simple scoring based on response characteristics
            score = 0.5  # Base score
            
            # Check for professional tone
            if any(word in text.lower() for word in ['thank', 'appreciate', 'understand']):
                score += 0.2
            
            # Check for constructive language
            if any(word in text.lower() for word in ['improve', 'better', 'working', 'address']):
                score += 0.2
            
            # Penalize defensive language
            if any(word in text.lower() for word in ['wrong', 'false', 'incorrect']):
                score -= 0.1
            
            # Check length (not too short, not too long)
            word_count = len(text.split())
            if 20 <= word_count <= 100:
                score += 0.1
            
            return {
                'quality_score': min(1.0, max(0.0, score)),
                'word_count': word_count,
                'analysis': 'Automated quality assessment'
            }
            
        except Exception as e:
            logger.error(f"Error parsing quality response: {e}")
            return {'quality_score': 0.5, 'word_count': 0, 'analysis': 'Error in analysis'}


class AIAgentService:
    """Service for generating AI-powered brand responses."""
    
    def __init__(self):
        self.llm: Optional[OpenAI] = None
        self.response_chain: Optional[LLMChain] = None
        self.quality_chain: Optional[LLMChain] = None
        self.db_path = "echosense.db"
        self.fallback_responses = [
            "Thank you for your feedback. We're always working to improve our products and services.",
            "We appreciate you taking the time to share your thoughts. Your input helps us grow.",
            "We understand your concerns and are committed to addressing them. Please reach out to our support team.",
            "Your feedback is valuable to us. We're continuously working to enhance the customer experience.",
            "We hear you and are taking steps to improve. Thank you for bringing this to our attention."
        ]
        
    async def initialize(self):
        """Initialize the AI agent service."""
        logger.info("Initializing AI Agent Service...")
        
        try:
            # Initialize OpenAI client
            openai.api_key = settings.openai_api_key
            
            # Initialize LangChain LLM
            self.llm = OpenAI(
                openai_api_key=settings.openai_api_key,
                temperature=0.7,
                max_tokens=200,
                model_name="gpt-3.5-turbo-instruct"
            )
            
            # Create response generation chain
            response_prompt = PromptTemplate(
                input_variables=["brand", "post_content", "sentiment", "source"],
                template="""
You are a professional brand representative for {brand}. A customer has posted the following content on {source}:

"{post_content}"

The sentiment of this post is: {sentiment}

Generate a professional, empathetic, and constructive response that:
1. Acknowledges the customer's feedback
2. Shows that the brand cares about customer experience
3. Offers a path forward or solution when appropriate
4. Maintains a positive and professional tone
5. Is concise (under 100 words)

Response:
"""
            )
            
            self.response_chain = LLMChain(
                llm=self.llm,
                prompt=response_prompt,
                verbose=False
            )
            
            # Create quality evaluation chain
            quality_prompt = PromptTemplate(
                input_variables=["response"],
                template="""
Evaluate the quality of this brand response on a scale of 0.0 to 1.0:

"{response}"

Consider:
- Professional tone
- Empathy and understanding
- Constructive approach
- Appropriate length
- Brand-appropriate language

Quality Score (0.0-1.0):
"""
            )
            
            self.quality_chain = LLMChain(
                llm=self.llm,
                prompt=quality_prompt,
                output_parser=ResponseQualityParser(),
                verbose=False
            )
            
            logger.info("AI Agent Service initialized successfully")
            
        except Exception as e:
            logger.error(f"Failed to initialize AI Agent Service: {e}")
            logger.warning("AI Agent will use fallback responses")
    
    async def generate_response(self, post: Dict[str, Any]) -> Dict[str, Any]:
        """Generate an AI response for a single post."""
        try:
            if not self.response_chain:
                return await self.generate_fallback_response(post)
            
            # Determine primary brand mentioned
            brand = self.extract_brand_from_post(post['content'])
            
            # Generate response
            response_text = await asyncio.get_event_loop().run_in_executor(
                None,
                self.response_chain.run,
                {
                    'brand': brand,
                    'post_content': post['content'][:500],  # Limit content length
                    'sentiment': post.get('sentiment', 'neutral'),
                    'source': post['source']
                }
            )
            
            # Clean up response
            response_text = response_text.strip()
            
            # Evaluate response quality
            quality_result = await self.evaluate_response_quality(response_text)
            
            response_data = {
                'id': str(uuid.uuid4()),
                'response': response_text,
                'target_post_id': post['id'],
                'quality_score': quality_result['quality_score'],
                'timestamp': datetime.utcnow(),
                'brand': brand,
                'generated_by': 'ai'
            }
            
            # Store response in database
            await self.store_response(response_data)
            
            return response_data
            
        except Exception as e:
            logger.error(f"Error generating AI response: {e}")
            return await self.generate_fallback_response(post)
    
    async def generate_fallback_response(self, post: Dict[str, Any]) -> Dict[str, Any]:
        """Generate a fallback response when AI is unavailable."""
        import random
        
        response_text = random.choice(self.fallback_responses)
        
        response_data = {
            'id': str(uuid.uuid4()),
            'response': response_text,
            'target_post_id': post['id'],
            'quality_score': 0.6,  # Default quality for fallback
            'timestamp': datetime.utcnow(),
            'brand': 'Brand',
            'generated_by': 'fallback'
        }
        
        await self.store_response(response_data)
        return response_data
    
    async def evaluate_response_quality(self, response: str) -> Dict[str, Any]:
        """Evaluate the quality of a generated response."""
        try:
            if not self.quality_chain:
                return {'quality_score': 0.6, 'analysis': 'Quality evaluation unavailable'}
            
            quality_result = await asyncio.get_event_loop().run_in_executor(
                None,
                self.quality_chain.run,
                {'response': response}
            )
            
            return quality_result
            
        except Exception as e:
            logger.error(f"Error evaluating response quality: {e}")
            return {'quality_score': 0.5, 'analysis': 'Error in quality evaluation'}
    
    def extract_brand_from_post(self, content: str) -> str:
        """Extract the primary brand mentioned in the post."""
        content_lower = content.lower()
        
        for brand in settings.target_brands_list:
            if brand.lower() in content_lower:
                return brand
        
        # Default to first brand if none specifically mentioned
        return settings.target_brands_list[0] if settings.target_brands_list else "Brand"
    
    async def generate_responses_for_posts(self, posts: List[Dict[str, Any]]):
        """Generate responses for multiple posts."""
        logger.info(f"Generating AI responses for {len(posts)} posts...")
        
        tasks = []
        for post in posts:
            task = self.generate_response(post)
            tasks.append(task)
        
        # Generate responses concurrently
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        successful_responses = 0
        for i, result in enumerate(results):
            if isinstance(result, Exception):
                logger.error(f"Error generating response for post {i}: {result}")
            else:
                successful_responses += 1
        
        logger.info(f"Successfully generated {successful_responses} AI responses")
    
    async def store_response(self, response_data: Dict[str, Any]):
        """Store AI response in the database."""
        async with aiosqlite.connect(self.db_path) as db:
            await db.execute("""
                INSERT INTO ai_responses 
                (id, response, target_post_id, quality_score, timestamp)
                VALUES (?, ?, ?, ?, ?)
            """, (
                response_data['id'],
                response_data['response'],
                response_data['target_post_id'],
                response_data['quality_score'],
                response_data['timestamp']
            ))
            await db.commit()
    
    async def get_recent_responses(self, limit: int = 10) -> List[Dict[str, Any]]:
        """Get recent AI responses."""
        async with aiosqlite.connect(self.db_path) as db:
            cursor = await db.execute("""
                SELECT id, response, target_post_id, quality_score, timestamp
                FROM ai_responses 
                ORDER BY timestamp DESC 
                LIMIT ?
            """, (limit,))
            
            rows = await cursor.fetchall()
            
            responses = []
            for row in rows:
                responses.append({
                    'id': row[0],
                    'response': row[1],
                    'target_post': row[2],
                    'quality_score': row[3],
                    'timestamp': datetime.fromisoformat(row[4]) if isinstance(row[4], str) else row[4]
                })
            
            return responses
    
    async def get_response_analytics(self) -> Dict[str, Any]:
        """Get analytics about AI responses."""
        async with aiosqlite.connect(self.db_path) as db:
            # Get total responses
            cursor = await db.execute("SELECT COUNT(*) FROM ai_responses")
            total_responses = (await cursor.fetchone())[0]
            
            # Get average quality score
            cursor = await db.execute("SELECT AVG(quality_score) FROM ai_responses")
            avg_quality = (await cursor.fetchone())[0] or 0.0
            
            # Get responses in last 24 hours
            cursor = await db.execute("""
                SELECT COUNT(*) FROM ai_responses 
                WHERE timestamp > datetime('now', '-24 hours')
            """)
            recent_responses = (await cursor.fetchone())[0]
            
            return {
                'total_responses': total_responses,
                'average_quality_score': round(avg_quality, 2),
                'responses_last_24h': recent_responses
            }
    
    async def cleanup(self):
        """Cleanup resources."""
        self.llm = None
        self.response_chain = None
        self.quality_chain = None
        logger.info("AI Agent Service cleaned up")
