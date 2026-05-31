const { Pool } = require('pg');
const fs = require('fs').promises;
const path = require('path');

class DatabaseService {
  constructor() {
    this.pool = null;
    this.isInitialized = false;
  }

  async initialize() {
    try {
      // For development, use SQLite-like setup with PostgreSQL
      if (process.env.DATABASE_URL && process.env.DATABASE_URL.includes('postgresql')) {
        this.pool = new Pool({
          connectionString: process.env.DATABASE_URL,
        });
      } else {
        // Use local PostgreSQL for development
        this.pool = new Pool({
          user: process.env.DB_USER || 'postgres',
          host: process.env.DB_HOST || 'localhost',
          database: process.env.DB_NAME || 'echosense',
          password: process.env.DB_PASSWORD || 'password',
          port: process.env.DB_PORT || 5432,
        });
      }

      // Test connection
      await this.pool.query('SELECT NOW()');
      
      // Create tables if they don't exist
      await this.createTables();
      
      this.isInitialized = true;
      console.log('✅ Database service initialized');
    } catch (error) {
      console.error('❌ Database initialization failed:', error);
      // Fallback to in-memory storage for demo
      this.initializeInMemoryStorage();
    }
  }

  initializeInMemoryStorage() {
    console.log('🔄 Falling back to in-memory storage for demo');
    this.inMemoryData = {
      sentimentData: [],
      posts: [],
      analytics: {}
    };
    this.isInitialized = true;
  }

  async createTables() {
    const createTablesSQL = `
      CREATE TABLE IF NOT EXISTS sentiment_data (
        id SERIAL PRIMARY KEY,
        source VARCHAR(50) NOT NULL,
        platform VARCHAR(50) NOT NULL,
        content TEXT NOT NULL,
        sentiment_score DECIMAL(3,2) NOT NULL,
        sentiment_label VARCHAR(20) NOT NULL,
        confidence DECIMAL(3,2) NOT NULL,
        brand VARCHAR(100),
        keywords TEXT[],
        metadata JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS posts (
        id SERIAL PRIMARY KEY,
        platform VARCHAR(50) NOT NULL,
        post_id VARCHAR(255) UNIQUE NOT NULL,
        title TEXT,
        content TEXT NOT NULL,
        author VARCHAR(255),
        url TEXT,
        score INTEGER DEFAULT 0,
        comments_count INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        collected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS analytics_cache (
        id SERIAL PRIMARY KEY,
        cache_key VARCHAR(255) UNIQUE NOT NULL,
        data JSONB NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_sentiment_created_at ON sentiment_data(created_at);
      CREATE INDEX IF NOT EXISTS idx_sentiment_brand ON sentiment_data(brand);
      CREATE INDEX IF NOT EXISTS idx_posts_platform ON posts(platform);
      CREATE INDEX IF NOT EXISTS idx_analytics_cache_key ON analytics_cache(cache_key);
    `;

    if (this.pool) {
      await this.pool.query(createTablesSQL);
    }
  }

  async isHealthy() {
    try {
      if (this.pool) {
        await this.pool.query('SELECT 1');
        return true;
      }
      return this.isInitialized; // For in-memory fallback
    } catch (error) {
      return false;
    }
  }

  async saveSentimentData(data) {
    try {
      if (this.pool) {
        const query = `
          INSERT INTO sentiment_data (source, platform, content, sentiment_score, sentiment_label, confidence, brand, keywords, metadata)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
          RETURNING id
        `;
        const values = [
          data.source,
          data.platform,
          data.content,
          data.sentiment_score,
          data.sentiment_label,
          data.confidence,
          data.brand,
          data.keywords,
          JSON.stringify(data.metadata || {})
        ];
        
        const result = await this.pool.query(query, values);
        return result.rows[0].id;
      } else {
        // In-memory fallback
        const record = {
          id: this.inMemoryData.sentimentData.length + 1,
          ...data,
          created_at: new Date()
        };
        this.inMemoryData.sentimentData.push(record);
        return record.id;
      }
    } catch (error) {
      console.error('Failed to save sentiment data:', error);
      throw error;
    }
  }

  async savePost(post) {
    try {
      if (this.pool) {
        const query = `
          INSERT INTO posts (platform, post_id, title, content, author, url, score, comments_count)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          ON CONFLICT (post_id) DO UPDATE SET
            score = EXCLUDED.score,
            comments_count = EXCLUDED.comments_count
          RETURNING id
        `;
        const values = [
          post.platform,
          post.post_id,
          post.title,
          post.content,
          post.author,
          post.url,
          post.score || 0,
          post.comments_count || 0
        ];
        
        const result = await this.pool.query(query, values);
        return result.rows[0].id;
      } else {
        // In-memory fallback
        const existingIndex = this.inMemoryData.posts.findIndex(p => p.post_id === post.post_id);
        if (existingIndex >= 0) {
          this.inMemoryData.posts[existingIndex] = { ...post, id: existingIndex + 1 };
          return existingIndex + 1;
        } else {
          const record = {
            id: this.inMemoryData.posts.length + 1,
            ...post,
            created_at: new Date()
          };
          this.inMemoryData.posts.push(record);
          return record.id;
        }
      }
    } catch (error) {
      console.error('Failed to save post:', error);
      throw error;
    }
  }

  async getRecentSentimentData(hours = 24) {
    try {
      if (this.pool) {
        const query = `
          SELECT * FROM sentiment_data 
          WHERE created_at >= NOW() - INTERVAL '${hours} hours'
          ORDER BY created_at DESC
          LIMIT 1000
        `;
        const result = await this.pool.query(query);
        return result.rows;
      } else {
        // In-memory fallback
        const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);
        return this.inMemoryData.sentimentData
          .filter(item => new Date(item.created_at) >= cutoff)
          .slice(0, 1000);
      }
    } catch (error) {
      console.error('Failed to get recent sentiment data:', error);
      return [];
    }
  }

  async getLiveSentimentData() {
    try {
      if (this.pool) {
        const query = `
          SELECT 
            AVG(sentiment_score) as avg_sentiment,
            COUNT(*) as total_posts,
            platform,
            brand,
            DATE_TRUNC('hour', created_at) as hour
          FROM sentiment_data 
          WHERE created_at >= NOW() - INTERVAL '24 hours'
          GROUP BY platform, brand, hour
          ORDER BY hour DESC
        `;
        const result = await this.pool.query(query);
        return result.rows;
      } else {
        // In-memory fallback with mock live data
        return this.generateMockLiveData();
      }
    } catch (error) {
      console.error('Failed to get live sentiment data:', error);
      return this.generateMockLiveData();
    }
  }

  async getHistoricalSentimentData(hours = 24) {
    try {
      if (this.pool) {
        const query = `
          SELECT 
            DATE_TRUNC('hour', created_at) as timestamp,
            AVG(sentiment_score) as sentiment,
            COUNT(*) as volume,
            platform,
            brand
          FROM sentiment_data 
          WHERE created_at >= NOW() - INTERVAL '${hours} hours'
          GROUP BY timestamp, platform, brand
          ORDER BY timestamp ASC
        `;
        const result = await this.pool.query(query);
        return result.rows;
      } else {
        // In-memory fallback
        return this.generateMockHistoricalData(hours);
      }
    } catch (error) {
      console.error('Failed to get historical sentiment data:', error);
      return this.generateMockHistoricalData(hours);
    }
  }

  generateMockLiveData() {
    const platforms = ['reddit', 'news', 'youtube'];
    const brands = (process.env.TARGET_BRAND || 'Tesla,Zuntra').split(',');
    
    return platforms.flatMap(platform => 
      brands.map(brand => ({
        platform,
        brand: brand.trim(),
        avg_sentiment: 0.3 + Math.random() * 0.4, // 0.3 to 0.7
        total_posts: Math.floor(Math.random() * 50) + 10,
        hour: new Date()
      }))
    );
  }

  generateMockHistoricalData(hours) {
    const data = [];
    const brands = (process.env.TARGET_BRAND || 'Tesla,Zuntra').split(',');
    const platforms = ['reddit', 'news', 'youtube'];
    
    for (let i = 0; i < hours; i++) {
      const timestamp = new Date(Date.now() - i * 60 * 60 * 1000);
      
      platforms.forEach(platform => {
        brands.forEach(brand => {
          data.push({
            timestamp,
            sentiment: 0.3 + Math.random() * 0.4,
            volume: Math.floor(Math.random() * 20) + 5,
            platform,
            brand: brand.trim()
          });
        });
      });
    }
    
    return data.reverse(); // Chronological order
  }

  async close() {
    if (this.pool) {
      await this.pool.end();
    }
  }
}

module.exports = DatabaseService;
