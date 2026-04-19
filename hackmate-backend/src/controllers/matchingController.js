const { getRecommendations } = require('../services/matchingService');
const cache = require('../services/cacheService');
const pool  = require('../config/db');

const getRecommendationsHandler = async (req, res) => {
  try {
    const userId      = req.user.id;
    const hackathonId = req.params.id;
    const limit       = Math.min(parseInt(req.query.limit) || 20, 50);

    // verify user joined hackathon pool
    const joined = await pool.query(
      `SELECT id FROM user_hackathon_prefs
       WHERE user_id = $1 AND hackathon_id = $2`,
      [userId, hackathonId]
    );
    if (joined.rows.length === 0)
      return res.status(200).json({
        joined: false,
        error: 'You must join this hackathon pool before getting recommendations',
        recommendations: []
      });

    // check cache first
    const cacheKey = `recommendations:${userId}:${hackathonId}:${limit}`;
    const cached   = await cache.get(cacheKey);
    if (cached) {
      return res.status(200).json({ ...cached, cached: true });
    }

    const recommendations = await getRecommendations(userId, hackathonId, limit);

    const response = { hackathon_id: hackathonId, total: recommendations.length, recommendations };

    // cache for 5 minutes
    await cache.set(cacheKey, response, cache.TTL.RECOMMENDATIONS);

    return res.status(200).json(response);

  } catch (err) {
    console.error('getRecommendations error:', err.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = { getRecommendationsHandler };
