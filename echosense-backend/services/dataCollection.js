const axios = require('axios');
const snoowrap = require('snoowrap');
const { RateLimiterMemory } = require('rate-limiter-flexible');

class DataCollectionService {
  constructor({ database, cache, sentiment, logger }) {
    this.database = database;
    this.cache = cache;
    this.sentiment = sentiment;
    this.logger = logger;
    this.isRunning = false;
    
    // Initialize API clients
    this.redditClient = null;
    this.newsApiKey = process.env.NEWS_API_KEY;
    this.youtubeApiKey = process.env.YOUTUBE_API_KEY;
    
    // Configuration
    this.targetBrands = (process.env.TARGET_BRAND || 'Tesla,Zuntra').split(',').map(b => b.trim());
    this.subreddits = (process.env.SUBREDDITS || 'technology,news,cars,electricvehicles').split(',').map(s => s.trim());
    this.newsKeywords = (process.env.NEWS_KEYWORDS || 'Tesla,Elon Musk,electric vehicle').split(',').map(k => k.trim());
    this.maxPostsPerSource = parseInt(process.env.MAX_POSTS_PER_SOURCE) || 50;
    
    // Rate limiters
    this.redditLimiter = new RateLimiterMemory({
      keyGenerator: () => 'reddit',
      points: 60, // 60 requests
      duration: 60, // per 60 seconds
    });
    
    this.newsLimiter = new RateLimiterMemory({
      keyGenerator: () => 'news',
      points: 100, // 100 requests
      duration: 86400, // per day (News API limit)
    });
    
    this.youtubeLimiter = new RateLimiterMemory({
      keyGenerator: () => 'youtube',
      points: 100, // 100 requests
      duration: 86400, // per day
    });
    
    this.initialize();
  }

  async initialize() {
    try {
      // Initialize Reddit client
      if (process.env.REDDIT_CLIENT_ID && process.env.REDDIT_CLIENT_SECRET) {
        this.redditClient = new snoowrap({
          userAgent: process.env.REDDIT_USER_AGENT || 'EchoSense:v1.0.0',
          clientId: process.env.REDDIT_CLIENT_ID,
          clientSecret: process.env.REDDIT_CLIENT_SECRET,
          refreshToken: process.env.REDDIT_REFRESH_TOKEN,
          accessToken: process.env.REDDIT_ACCESS_TOKEN
        });
        
        this.logger.info('✅ Reddit client initialized');
      } else {
        this.logger.warn('⚠️ Reddit credentials not found, Reddit collection disabled');
      }
      
      // Validate other API keys
      if (!this.newsApiKey) {
        this.logger.warn('⚠️ News API key not found, News collection disabled');
      }
      
      if (!this.youtubeApiKey) {
        this.logger.warn('⚠️ YouTube API key not found, YouTube collection disabled');
      }
      
      this.logger.info('✅ Data Collection service initialized');
    } catch (error) {
      this.logger.error('❌ Data Collection initialization failed:', error);
    }
  }

  async collectAllData() {
    if (this.isRunning) {
      this.logger.info('Data collection already running, skipping...');
      return;
    }

    this.isRunning = true;
    this.logger.info('🚀 Starting data collection cycle...');

    try {
      const results = await Promise.allSettled([
        this.collectRedditData(),
        this.collectNewsData(),
        this.collectYouTubeData()
      ]);

      let totalCollected = 0;
      results.forEach((result, index) => {
        const sources = ['Reddit', 'News', 'YouTube'];
        if (result.status === 'fulfilled') {
          totalCollected += result.value || 0;
          this.logger.info(`✅ ${sources[index]} collection completed: ${result.value} items`);
        } else {
          this.logger.error(`❌ ${sources[index]} collection failed:`, result.reason);
        }
      });

      this.logger.info(`📊 Data collection cycle completed. Total items: ${totalCollected}`);
    } catch (error) {
      this.logger.error('Data collection cycle failed:', error);
    } finally {
      this.isRunning = false;
    }
  }

  async collectRedditData() {
    if (!this.redditClient) {
      this.logger.warn('Reddit client not available, skipping Reddit collection');
      return 0;
    }

    let totalCollected = 0;

    try {
      for (const subreddit of this.subreddits) {
        await this.redditLimiter.consume('reddit');
        
        try {
          const posts = await this.redditClient.getSubreddit(subreddit)
            .getHot({ limit: this.maxPostsPerSource });

          for (const post of posts) {
            // Check if post mentions target brands
            const content = `${post.title} ${post.selftext || ''}`;
            const mentionedBrands = this.extractBrandMentions(content);
            
            if (mentionedBrands.length > 0) {
              // Save post data
              await this.database.savePost({
                platform: 'reddit',
                post_id: post.id,
                title: post.title,
                content: post.selftext || '',
                author: post.author.name,
                url: `https://reddit.com${post.permalink}`,
                score: post.score,
                comments_count: post.num_comments
              });

              // Analyze sentiment
              const sentimentResult = await this.sentiment.analyzeSentiment(content);
              
              // Save sentiment data
              await this.database.saveSentimentData({
                source: subreddit,
                platform: 'reddit',
                content: content.substring(0, 1000), // Limit content length
                sentiment_score: sentimentResult.sentiment_score,
                sentiment_label: sentimentResult.sentiment_label,
                confidence: sentimentResult.confidence,
                brand: mentionedBrands[0], // Primary brand
                keywords: sentimentResult.keywords,
                metadata: {
                  post_id: post.id,
                  author: post.author.name,
                  score: post.score,
                  comments: post.num_comments,
                  subreddit: subreddit
                }
              });

              totalCollected++;
            }
          }
          
          this.logger.info(`📱 Collected ${totalCollected} posts from r/${subreddit}`);
        } catch (subredditError) {
          this.logger.error(`Failed to collect from r/${subreddit}:`, subredditError);
        }
      }
    } catch (error) {
      this.logger.error('Reddit data collection failed:', error);
    }

    return totalCollected;
  }

  async collectNewsData() {
    if (!this.newsApiKey) {
      this.logger.warn('News API key not available, skipping News collection');
      return 0;
    }

    let totalCollected = 0;

    try {
      for (const keyword of this.newsKeywords) {
        await this.newsLimiter.consume('news');
        
        try {
          const response = await axios.get('https://newsapi.org/v2/everything', {
            params: {
              q: keyword,
              language: 'en',
              sortBy: 'publishedAt',
              pageSize: Math.min(this.maxPostsPerSource, 100),
              apiKey: this.newsApiKey
            },
            timeout: 10000
          });

          const articles = response.data.articles || [];
          
          for (const article of articles) {
            if (!article.title || !article.description) continue;
            
            const content = `${article.title} ${article.description}`;
            const mentionedBrands = this.extractBrandMentions(content);
            
            if (mentionedBrands.length > 0) {
              // Save post data
              await this.database.savePost({
                platform: 'news',
                post_id: `news_${Buffer.from(article.url || '').toString('base64').substring(0, 20)}`,
                title: article.title,
                content: article.description || '',
                author: article.source?.name || 'Unknown',
                url: article.url,
                score: 0,
                comments_count: 0
              });

              // Analyze sentiment
              const sentimentResult = await this.sentiment.analyzeSentiment(content);
              
              // Save sentiment data
              await this.database.saveSentimentData({
                source: keyword,
                platform: 'news',
                content: content.substring(0, 1000),
                sentiment_score: sentimentResult.sentiment_score,
                sentiment_label: sentimentResult.sentiment_label,
                confidence: sentimentResult.confidence,
                brand: mentionedBrands[0],
                keywords: sentimentResult.keywords,
                metadata: {
                  source_name: article.source?.name,
                  published_at: article.publishedAt,
                  url: article.url,
                  keyword: keyword
                }
              });

              totalCollected++;
            }
          }
          
          this.logger.info(`📰 Collected ${totalCollected} articles for keyword: ${keyword}`);
        } catch (keywordError) {
          this.logger.error(`Failed to collect news for keyword ${keyword}:`, keywordError);
        }
      }
    } catch (error) {
      this.logger.error('News data collection failed:', error);
    }

    return totalCollected;
  }

  async collectYouTubeData() {
    if (!this.youtubeApiKey) {
      this.logger.warn('YouTube API key not available, skipping YouTube collection');
      return 0;
    }

    let totalCollected = 0;

    try {
      for (const keyword of this.newsKeywords) {
        await this.youtubeLimiter.consume('youtube');
        
        try {
          const response = await axios.get('https://www.googleapis.com/youtube/v3/search', {
            params: {
              part: 'snippet',
              q: keyword,
              type: 'video',
              order: 'relevance',
              maxResults: Math.min(this.maxPostsPerSource, 50),
              key: this.youtubeApiKey
            },
            timeout: 10000
          });

          const videos = response.data.items || [];
          
          for (const video of videos) {
            const snippet = video.snippet;
            if (!snippet.title || !snippet.description) continue;
            
            const content = `${snippet.title} ${snippet.description}`;
            const mentionedBrands = this.extractBrandMentions(content);
            
            if (mentionedBrands.length > 0) {
              // Save post data
              await this.database.savePost({
                platform: 'youtube',
                post_id: video.id.videoId,
                title: snippet.title,
                content: snippet.description,
                author: snippet.channelTitle,
                url: `https://www.youtube.com/watch?v=${video.id.videoId}`,
                score: 0,
                comments_count: 0
              });

              // Analyze sentiment
              const sentimentResult = await this.sentiment.analyzeSentiment(content);
              
              // Save sentiment data
              await this.database.saveSentimentData({
                source: keyword,
                platform: 'youtube',
                content: content.substring(0, 1000),
                sentiment_score: sentimentResult.sentiment_score,
                sentiment_label: sentimentResult.sentiment_label,
                confidence: sentimentResult.confidence,
                brand: mentionedBrands[0],
                keywords: sentimentResult.keywords,
                metadata: {
                  video_id: video.id.videoId,
                  channel: snippet.channelTitle,
                  published_at: snippet.publishedAt,
                  keyword: keyword
                }
              });

              totalCollected++;
            }
          }
          
          this.logger.info(`📺 Collected ${totalCollected} videos for keyword: ${keyword}`);
        } catch (keywordError) {
          this.logger.error(`Failed to collect YouTube data for keyword ${keyword}:`, keywordError);
        }
      }
    } catch (error) {
      this.logger.error('YouTube data collection failed:', error);
    }

    return totalCollected;
  }

  extractBrandMentions(content) {
    const lowerContent = content.toLowerCase();
    const mentions = [];
    
    this.targetBrands.forEach(brand => {
      if (lowerContent.includes(brand.toLowerCase())) {
        mentions.push(brand);
      }
    });
    
    return mentions;
  }

  isRunning() {
    return this.isRunning;
  }

  getStats() {
    return {
      isRunning: this.isRunning,
      targetBrands: this.targetBrands,
      subreddits: this.subreddits,
      newsKeywords: this.newsKeywords,
      maxPostsPerSource: this.maxPostsPerSource,
      hasRedditClient: !!this.redditClient,
      hasNewsApiKey: !!this.newsApiKey,
      hasYouTubeApiKey: !!this.youtubeApiKey
    };
  }
}

module.exports = DataCollectionService;
