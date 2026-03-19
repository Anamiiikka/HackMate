const redis = require('../config/redis');

/**
 * Creates a Redis-backed rate limiter
 * @param {number} maxRequests - max requests allowed
 * @param {number} windowSecs  - window in seconds
 * @param {string} prefix      - key prefix to namespace limiters
 */
const createRateLimiter = (maxRequests, windowSecs, prefix) => {
  return async (req, res, next) => {
    const identifier = req.user?.id || req.ip;
    const key        = `ratelimit:${prefix}:${identifier}`;

    try {
      const current = await redis.incr(key);

      // set expiry only on first request
      if (current === 1) await redis.expire(key, windowSecs);

      // set headers
      res.setHeader('X-RateLimit-Limit',     maxRequests);
      res.setHeader('X-RateLimit-Remaining', Math.max(0, maxRequests - current));

      if (current > maxRequests) {
        const ttl = await redis.ttl(key);
        res.setHeader('Retry-After', ttl);
        return res.status(429).json({
          error: `Too many requests. Try again in ${ttl} seconds.`
        });
      }

      next();
    } catch {
      // if Redis is down, fail open (don't block users)
      next();
    }
  };
};

// specific limiters for sensitive endpoints
const matchingLimiter     = createRateLimiter(10,  60,  'matching');    // 10/min
const requestSendLimiter  = createRateLimiter(20,  60,  'req_send');    // 20/min
const authLimiter         = createRateLimiter(5,   300, 'auth');        // 5 per 5min
const messageLimiter      = createRateLimiter(60,  60,  'message');     // 60/min

module.exports = {
  matchingLimiter,
  requestSendLimiter,
  authLimiter,
  messageLimiter
};
