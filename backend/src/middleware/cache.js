import NodeCache from 'node-cache';

// Create cache instance
const cache = new NodeCache({ 
  stdTTL: 300, // 5 minutes
  checkperiod: 600, // 10 minutes
  useClones: false
});

export const cacheMiddleware = (duration = 300) => {
  return (req, res, next) => {
    const key = req.originalUrl;
    const cached = cache.get(key);
    
    if (cached) {
      console.log(`Cache HIT for ${key}`);
      return res.json(cached);
    }
    
    console.log(`Cache MISS for ${key}`);
    
    // Override res.json to cache the response
    const originalJson = res.json;
    res.json = function(body) {
      cache.set(key, body, duration);
      return originalJson.call(this, body);
    };
    
    next();
  };
};

export const invalidateCache = (pattern) => {
  const keys = cache.keys();
  const regex = new RegExp(pattern);
  keys.forEach(key => {
    if (regex.test(key)) {
      cache.del(key);
    }
  });
};

export const getCacheStats = () => {
  return {
    keys: cache.keys().length,
    stats: cache.getStats()
  };
};

export default cache;
