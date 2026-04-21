const Redis = require('ioredis');

const redis = new Redis({
  host:     process.env.REDIS_HOST || 'localhost',
  port:     parseInt(process.env.REDIS_PORT) || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
  maxRetriesPerRequest: 1,        // fail fast on individual commands
  retryStrategy: (times) => {
    if (times > 3) {
      console.warn('⚠️  Redis unavailable – chat rate-limiting disabled');
      return null; // stop reconnecting
    }
    return Math.min(times * 200, 1000);
  },
  lazyConnect: false,
});

let redisReady = false;

redis.on('connect', () => { redisReady = true;  console.log('✅ Redis connected'); });
redis.on('ready',   () => { redisReady = true; });
redis.on('close',   () => { redisReady = false; });
redis.on('end',     () => { redisReady = false; });
redis.on('error',   (err) => {
  redisReady = false;
  // Log but do NOT crash the process
  console.error('Redis error:', err.message);
});

/** Returns true when Redis is usable. */
redis.isReady = () => redisReady;

module.exports = redis;

