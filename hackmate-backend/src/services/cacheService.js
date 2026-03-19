const redis = require('../config/redis');

const TTL = {
  RECOMMENDATIONS: 60 * 5,   // 5 minutes
  HACKATHONS:      60 * 30,  // 30 minutes
  SKILLS:          60 * 60,  // 1 hour
  USER_PROFILE:    60 * 2,   // 2 minutes
};

const get = async (key) => {
  try {
    const data = await redis.get(key);
    return data ? JSON.parse(data) : null;
  } catch { return null; }
};

const set = async (key, value, ttl) => {
  try {
    await redis.setex(key, ttl, JSON.stringify(value));
  } catch {}
};

const del = async (...keys) => {
  try {
    await redis.del(...keys);
  } catch {}
};

const delPattern = async (pattern) => {
  try {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) await redis.del(...keys);
  } catch {}
};

module.exports = { get, set, del, delPattern, TTL };
