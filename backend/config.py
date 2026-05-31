"""
Configuration management for EchoSense backend.
Uses Pydantic for type validation and environment variable handling.
"""

import os
from typing import List, Optional

from pydantic import Field
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings with environment variable support."""
    
    # Server Configuration
    backend_port: int = Field(default=8000, description="Backend server port")
    frontend_port: int = Field(default=3000, description="Frontend server port")
    environment: str = Field(default="development", description="Environment (development/production)")
    log_level: str = Field(default="INFO", description="Logging level")
    demo_mode: bool = Field(default=True, description="Enable demo mode")
    
    # Database Configuration
    database_url: str = Field(default="sqlite:///./echosense.db", description="Database connection URL")
    
    # Reddit API Configuration
    reddit_client_id: str = Field(description="Reddit API client ID")
    reddit_client_secret: str = Field(description="Reddit API client secret")
    reddit_user_agent: str = Field(description="Reddit API user agent")
    
    # News API Configuration
    news_api_key: str = Field(description="NewsAPI key")
    
    # YouTube API Configuration
    youtube_api_key: str = Field(description="YouTube Data API key")
    
    # OpenAI API Configuration
    openai_api_key: str = Field(description="OpenAI API key")
    
    # Brand Configuration
    target_brand: str = Field(default="Tesla,Zuntra", description="Target brands to monitor")
    subreddits: str = Field(default="technology,news,cars", description="Subreddits to monitor")
    news_keywords: str = Field(default="Tesla,electric vehicle", description="News keywords to search")
    
    # Data Collection Configuration
    collection_interval: int = Field(default=120, description="Data collection interval in seconds")
    max_posts_per_source: int = Field(default=50, description="Maximum posts to collect per source")
    
    # Sentiment Analysis Configuration
    sentiment_model: str = Field(
        default="distilbert-base-uncased-finetuned-sst-2-english",
        description="Hugging Face sentiment model"
    )
    batch_size: int = Field(default=32, description="Batch size for sentiment analysis")
    use_gpu: bool = Field(default=False, description="Use GPU for sentiment analysis")
    
    # Forecasting Configuration
    forecast_hours: int = Field(default=48, description="Forecast horizon in hours")
    confidence_interval: float = Field(default=0.8, description="Confidence interval for forecasts")
    
    # Authentication Configuration
    nextauth_secret: str = Field(description="NextAuth secret key")
    nextauth_url: str = Field(default="http://localhost:3000", description="NextAuth URL")
    
    # Email Configuration
    email_server_host: str = Field(default="smtp.gmail.com", description="Email server host")
    email_server_port: int = Field(default=587, description="Email server port")
    email_server_user: str = Field(description="Email server username")
    email_server_password: str = Field(description="Email server password")
    email_from: str = Field(description="Email from address")
    
    # LLM Configuration
    llm_provider: str = Field(default="openai", description="LLM provider")
    llm_api_key: str = Field(description="LLM API key")
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = False
    
    @property
    def target_brands_list(self) -> List[str]:
        """Get target brands as a list."""
        return [brand.strip() for brand in self.target_brand.split(",")]
    
    @property
    def subreddits_list(self) -> List[str]:
        """Get subreddits as a list."""
        return [sub.strip() for sub in self.subreddits.split(",")]
    
    @property
    def news_keywords_list(self) -> List[str]:
        """Get news keywords as a list."""
        return [keyword.strip() for keyword in self.news_keywords.split(",")]
    
    @property
    def cors_origins(self) -> List[str]:
        """Get CORS origins for the frontend."""
        return [
            f"http://localhost:{self.frontend_port}",
            f"http://127.0.0.1:{self.frontend_port}",
            "http://localhost:3000",
            "http://127.0.0.1:3000",
        ]


# Global settings instance
settings = Settings()
