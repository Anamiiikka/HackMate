const { getRecommendations } = require('../services/matchingService');
const pool = require('../config/db');

const getRecommendationsHandler = async (req, res) => {
  try {
    const userId      = req.user.id;
    const hackathonId = req.params.id;
    const limit       = Math.min(parseInt(req.query.limit) || 20, 50);

    // verify user has joined this hackathon pool
    const joined = await pool.query(
      `SELECT id FROM user_hackathon_prefs
       WHERE user_id = $1 AND hackathon_id = $2`,
      [userId, hackathonId]
    );
    if (joined.rows.length === 0)
      return res.status(400).json({
        error: 'You must join this hackathon pool before getting recommendations'
      });

    const recommendations = await getRecommendations(userId, hackathonId, limit);

    return res.status(200).json({
      hackathon_id: hackathonId,
      total:        recommendations.length,
      recommendations
    });

  } catch (err) {
    console.error('getRecommendations error:', err.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = { getRecommendationsHandler };
