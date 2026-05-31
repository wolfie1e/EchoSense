const redis = require('redis');
const NodeCache = require('node-cache');

class CacheService {
  constructor() {
    this.redisClient = null;
    this.nodeCache = null;
    this.isInitialized = false;
    this.useRedis = false;
  }

  async initialize() {
    try {
      // Try to connect to Redis first
      if (process.env.REDIS_URL || process.env.REDIS_HOST) {
        await this.initializeRedis();
      } else {
        // Fallback to in-memory cache
        this.initializeNodeCache();
      }
      
      this.isInitialized = true;
      console.log(`✅ Cache service initialized (${this.useRedis ? 'Redis' : 'In-Memory'})`);
    } catch (error) {
      console.error('❌ Cache initialization failed:', error);
      // Always fallback to in-memory cache
      this.initializeNodeCache();
      this.isInitialized = true;
    }
  }

  async initializeRedis() {
    try {
      const redisConfig = process.env.REDIS_URL ? 
        { url: process.env.REDIS_URL } : 
        {
          host: process.env.REDIS_HOST || 'localhost',
          port: process.env.REDIS_PORT || 6379,
          password: process.env.REDIS_PASSWORD
        };

      this.redisClient = redis.createClient(redisConfig);
      
      this.redisClient.on('error', (err) => {
        console.error('Redis Client Error:', err);
        this.useRedis = false;
        this.initializeNodeCache();
      });

      this.redisClient.on('connect', () => {
        console.log('✅ Connected to Redis');
        this.useRedis = true;
      });

      await this.redisClient.connect();
    } catch (error) {
      console.error('Failed to initialize Redis:', error);
      throw error;
    }
  }

  initializeNodeCache() {
    // Initialize in-memory cache with 1 hour default TTL
    this.nodeCache = new NodeCache({ 
      stdTTL: 3600, // 1 hour default
      checkperiod: 600, // Check for expired keys every 10 minutes
      useClones: false // Better performance
    });
    
    this.useRedis = false;
    console.log('🔄 Using in-memory cache (NodeCache)');
  }

  async isHealthy() {
    try {
      if (this.useRedis && this.redisClient) {
        await this.redisClient.ping();
        return true;
      } else if (this.nodeCache) {
        return true;
      }
      return false;
    } catch (error) {
      return false;
    }
  }

  async get(key) {
    try {
      if (this.useRedis && this.redisClient) {
        const value = await this.redisClient.get(key);
        return value ? JSON.parse(value) : null;
      } else if (this.nodeCache) {
        return this.nodeCache.get(key) || null;
      }
      return null;
    } catch (error) {
      console.error(`Failed to get cache key ${key}:`, error);
      return null;
    }
  }

  async set(key, value, ttlSeconds = 3600) {
    try {
      if (this.useRedis && this.redisClient) {
        await this.redisClient.setEx(key, ttlSeconds, JSON.stringify(value));
        return true;
      } else if (this.nodeCache) {
        return this.nodeCache.set(key, value, ttlSeconds);
      }
      return false;
    } catch (error) {
      console.error(`Failed to set cache key ${key}:`, error);
      return false;
    }
  }

  async del(key) {
    try {
      if (this.useRedis && this.redisClient) {
        await this.redisClient.del(key);
        return true;
      } else if (this.nodeCache) {
        return this.nodeCache.del(key) > 0;
      }
      return false;
    } catch (error) {
      console.error(`Failed to delete cache key ${key}:`, error);
      return false;
    }
  }

  async exists(key) {
    try {
      if (this.useRedis && this.redisClient) {
        const result = await this.redisClient.exists(key);
        return result === 1;
      } else if (this.nodeCache) {
        return this.nodeCache.has(key);
      }
      return false;
    } catch (error) {
      console.error(`Failed to check cache key ${key}:`, error);
      return false;
    }
  }

  async keys(pattern = '*') {
    try {
      if (this.useRedis && this.redisClient) {
        return await this.redisClient.keys(pattern);
      } else if (this.nodeCache) {
        const allKeys = this.nodeCache.keys();
        if (pattern === '*') {
          return allKeys;
        }
        // Simple pattern matching for NodeCache
        const regex = new RegExp(pattern.replace(/\*/g, '.*'));
        return allKeys.filter(key => regex.test(key));
      }
      return [];
    } catch (error) {
      console.error(`Failed to get cache keys with pattern ${pattern}:`, error);
      return [];
    }
  }

  async flush() {
    try {
      if (this.useRedis && this.redisClient) {
        await this.redisClient.flushAll();
        return true;
      } else if (this.nodeCache) {
        this.nodeCache.flushAll();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to flush cache:', error);
      return false;
    }
  }

  async getStats() {
    try {
      if (this.useRedis && this.redisClient) {
        const info = await this.redisClient.info('memory');
        return {
          type: 'redis',
          memory: info,
          connected: true
        };
      } else if (this.nodeCache) {
        const stats = this.nodeCache.getStats();
        return {
          type: 'node-cache',
          keys: stats.keys,
          hits: stats.hits,
          misses: stats.misses,
          ksize: stats.ksize,
          vsize: stats.vsize
        };
      }
      return { type: 'none', connected: false };
    } catch (error) {
      console.error('Failed to get cache stats:', error);
      return { type: 'error', error: error.message };
    }
  }

  // Utility methods for common caching patterns
  async getOrSet(key, fetchFunction, ttlSeconds = 3600) {
    try {
      let value = await this.get(key);
      
      if (value === null) {
        value = await fetchFunction();
        if (value !== null && value !== undefined) {
          await this.set(key, value, ttlSeconds);
        }
      }
      
      return value;
    } catch (error) {
      console.error(`Failed to getOrSet for key ${key}:`, error);
      // If cache fails, still try to fetch the data
      try {
        return await fetchFunction();
      } catch (fetchError) {
        console.error(`Failed to fetch data for key ${key}:`, fetchError);
        return null;
      }
    }
  }

  async increment(key, amount = 1, ttlSeconds = 3600) {
    try {
      if (this.useRedis && this.redisClient) {
        const result = await this.redisClient.incrBy(key, amount);
        await this.redisClient.expire(key, ttlSeconds);
        return result;
      } else if (this.nodeCache) {
        const current = this.nodeCache.get(key) || 0;
        const newValue = current + amount;
        this.nodeCache.set(key, newValue, ttlSeconds);
        return newValue;
      }
      return amount;
    } catch (error) {
      console.error(`Failed to increment key ${key}:`, error);
      return null;
    }
  }

  async close() {
    try {
      if (this.redisClient) {
        await this.redisClient.quit();
      }
      if (this.nodeCache) {
        this.nodeCache.close();
      }
    } catch (error) {
      console.error('Error closing cache service:', error);
    }
  }
}

module.exports = CacheService;
