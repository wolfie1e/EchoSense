class SentimentAnalysisService {
  constructor() {
    this.isInitialized = false;
    this.modelName = process.env.SENTIMENT_MODEL || 'distilbert-base-uncased-finetuned-sst-2-english';
    this.batchSize = parseInt(process.env.BATCH_SIZE) || 32;
    this.initialize();
  }

  initialize() {
    try {
      // For production, you would initialize the actual DistilBERT model here
      // For now, we'll use a rule-based approach with keyword analysis
      this.positiveKeywords = [
        'excellent', 'amazing', 'great', 'fantastic', 'wonderful', 'awesome', 'love', 'perfect',
        'outstanding', 'brilliant', 'superb', 'magnificent', 'incredible', 'remarkable',
        'innovation', 'revolutionary', 'breakthrough', 'cutting-edge', 'advanced', 'efficient',
        'sustainable', 'eco-friendly', 'green', 'clean', 'renewable', 'future'
      ];

      this.negativeKeywords = [
        'terrible', 'awful', 'horrible', 'bad', 'worst', 'hate', 'disgusting', 'pathetic',
        'disappointing', 'frustrating', 'annoying', 'useless', 'broken', 'failed',
        'expensive', 'overpriced', 'costly', 'waste', 'scam', 'fraud', 'problem',
        'issue', 'bug', 'error', 'crash', 'slow', 'delayed', 'cancelled'
      ];

      this.neutralKeywords = [
        'okay', 'fine', 'average', 'normal', 'standard', 'typical', 'regular',
        'moderate', 'acceptable', 'decent', 'fair', 'reasonable'
      ];

      this.isInitialized = true;
      console.log('✅ Sentiment Analysis service initialized (Rule-based)');
    } catch (error) {
      console.error('❌ Sentiment Analysis initialization failed:', error);
      this.isInitialized = false;
    }
  }

  async analyzeSentiment(text) {
    if (!this.isInitialized) {
      return this.getDefaultSentiment();
    }

    try {
      // Clean and normalize text
      const cleanText = this.preprocessText(text);
      
      // Calculate sentiment score using keyword analysis
      const sentiment = this.calculateSentimentScore(cleanText);
      
      return {
        sentiment_score: sentiment.score,
        sentiment_label: sentiment.label,
        confidence: sentiment.confidence,
        keywords: sentiment.keywords
      };
    } catch (error) {
      console.error('Failed to analyze sentiment:', error);
      return this.getDefaultSentiment();
    }
  }

  async analyzeBatch(texts) {
    if (!Array.isArray(texts)) {
      return [];
    }

    const results = [];
    const batchSize = this.batchSize;

    // Process in batches for better performance
    for (let i = 0; i < texts.length; i += batchSize) {
      const batch = texts.slice(i, i + batchSize);
      const batchResults = await Promise.all(
        batch.map(text => this.analyzeSentiment(text))
      );
      results.push(...batchResults);
    }

    return results;
  }

  preprocessText(text) {
    if (!text || typeof text !== 'string') {
      return '';
    }

    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ') // Remove punctuation
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
  }

  calculateSentimentScore(text) {
    const words = text.split(' ').filter(word => word.length > 2);
    
    let positiveScore = 0;
    let negativeScore = 0;
    let neutralScore = 0;
    let foundKeywords = [];

    // Count keyword matches
    words.forEach(word => {
      if (this.positiveKeywords.includes(word)) {
        positiveScore += 1;
        foundKeywords.push({ word, type: 'positive' });
      } else if (this.negativeKeywords.includes(word)) {
        negativeScore += 1;
        foundKeywords.push({ word, type: 'negative' });
      } else if (this.neutralKeywords.includes(word)) {
        neutralScore += 0.5;
        foundKeywords.push({ word, type: 'neutral' });
      }
    });

    // Calculate base sentiment score
    const totalScore = positiveScore + negativeScore + neutralScore;
    let sentimentScore;
    let confidence;

    if (totalScore === 0) {
      // No keywords found, assume neutral with low confidence
      sentimentScore = 0.5;
      confidence = 0.3;
    } else {
      // Calculate weighted sentiment score
      const positiveWeight = positiveScore / totalScore;
      const negativeWeight = negativeScore / totalScore;
      
      sentimentScore = (positiveWeight * 0.8) + (negativeWeight * 0.2) + 0.1;
      confidence = Math.min(0.95, Math.max(0.4, totalScore / words.length * 2));
    }

    // Apply text length and context modifiers
    sentimentScore = this.applyContextModifiers(text, sentimentScore);
    
    // Ensure score is within bounds
    sentimentScore = Math.max(0, Math.min(1, sentimentScore));

    // Determine label
    let label;
    if (sentimentScore >= 0.6) {
      label = 'POSITIVE';
    } else if (sentimentScore <= 0.4) {
      label = 'NEGATIVE';
    } else {
      label = 'NEUTRAL';
    }

    return {
      score: parseFloat(sentimentScore.toFixed(3)),
      label,
      confidence: parseFloat(confidence.toFixed(3)),
      keywords: foundKeywords.map(k => k.word)
    };
  }

  applyContextModifiers(text, baseScore) {
    let modifiedScore = baseScore;

    // Check for negation words
    const negationWords = ['not', 'no', 'never', 'none', 'nothing', 'nowhere', 'neither', 'nobody'];
    const hasNegation = negationWords.some(word => text.includes(word));
    
    if (hasNegation) {
      // Flip sentiment if negation is present
      modifiedScore = 1 - modifiedScore;
    }

    // Check for intensifiers
    const intensifiers = ['very', 'extremely', 'incredibly', 'absolutely', 'completely', 'totally'];
    const hasIntensifier = intensifiers.some(word => text.includes(word));
    
    if (hasIntensifier) {
      // Amplify sentiment
      if (modifiedScore > 0.5) {
        modifiedScore = Math.min(1, modifiedScore * 1.2);
      } else {
        modifiedScore = Math.max(0, modifiedScore * 0.8);
      }
    }

    // Check for question marks (usually neutral or seeking information)
    if (text.includes('?')) {
      modifiedScore = (modifiedScore + 0.5) / 2; // Pull towards neutral
    }

    // Check for exclamation marks (usually more emotional)
    const exclamationCount = (text.match(/!/g) || []).length;
    if (exclamationCount > 0) {
      const intensity = Math.min(0.2, exclamationCount * 0.1);
      if (modifiedScore > 0.5) {
        modifiedScore = Math.min(1, modifiedScore + intensity);
      } else {
        modifiedScore = Math.max(0, modifiedScore - intensity);
      }
    }

    return modifiedScore;
  }

  extractBrandMentions(text, brands) {
    if (!brands || !Array.isArray(brands)) {
      return [];
    }

    const cleanText = text.toLowerCase();
    const mentions = [];

    brands.forEach(brand => {
      const brandLower = brand.toLowerCase();
      if (cleanText.includes(brandLower)) {
        mentions.push(brand);
      }
    });

    return mentions;
  }

  extractKeywords(text, maxKeywords = 10) {
    const words = this.preprocessText(text).split(' ');
    const wordFreq = {};

    // Count word frequency
    words.forEach(word => {
      if (word.length > 3) { // Only consider words longer than 3 characters
        wordFreq[word] = (wordFreq[word] || 0) + 1;
      }
    });

    // Sort by frequency and return top keywords
    return Object.entries(wordFreq)
      .sort(([,a], [,b]) => b - a)
      .slice(0, maxKeywords)
      .map(([word]) => word);
  }

  getEmotionAnalysis(text) {
    // Simple emotion detection based on keywords
    const emotions = {
      joy: ['happy', 'excited', 'thrilled', 'delighted', 'pleased', 'satisfied'],
      anger: ['angry', 'furious', 'mad', 'irritated', 'annoyed', 'frustrated'],
      fear: ['scared', 'afraid', 'worried', 'anxious', 'concerned', 'nervous'],
      sadness: ['sad', 'disappointed', 'upset', 'depressed', 'unhappy'],
      surprise: ['surprised', 'shocked', 'amazed', 'astonished', 'stunned'],
      trust: ['trust', 'confident', 'reliable', 'dependable', 'secure']
    };

    const cleanText = this.preprocessText(text);
    const emotionScores = {};

    Object.entries(emotions).forEach(([emotion, keywords]) => {
      const matches = keywords.filter(keyword => cleanText.includes(keyword)).length;
      emotionScores[emotion] = matches;
    });

    // Find dominant emotion
    const dominantEmotion = Object.entries(emotionScores)
      .sort(([,a], [,b]) => b - a)[0];

    return {
      dominant_emotion: dominantEmotion[1] > 0 ? dominantEmotion[0] : 'neutral',
      emotion_scores: emotionScores
    };
  }

  getDefaultSentiment() {
    return {
      sentiment_score: 0.5,
      sentiment_label: 'NEUTRAL',
      confidence: 0.3,
      keywords: []
    };
  }

  // Utility method for testing sentiment analysis
  testSentiment(testCases) {
    console.log('🧪 Testing Sentiment Analysis:');
    testCases.forEach((testCase, index) => {
      const result = this.analyzeSentiment(testCase);
      console.log(`Test ${index + 1}: "${testCase}"`);
      console.log(`Result: ${result.sentiment_label} (${result.sentiment_score}) - Confidence: ${result.confidence}`);
      console.log('---');
    });
  }
}

module.exports = SentimentAnalysisService;
