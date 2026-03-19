const pool = require('../config/db');

/**
 * Compute Jaccard-style skill overlap score between two skill arrays
 * Each skill has { skill_id, proficiency }
 * Score = weighted intersection / weighted union (0 to 1)
 */
const computeSkillScore = (mySkills, theirSkills, lookingFor = []) => {
  if (!mySkills.length || !theirSkills.length) return 0;

  const myMap    = new Map(mySkills.map(s => [s.skill_id, s.proficiency]));
  const theirMap = new Map(theirSkills.map(s => [s.skill_id, s.proficiency]));

  // bonus: skills I am looking for in teammates
  const lookingForSet = new Set(lookingFor);

  let intersection = 0;
  let union        = 0;

  const allSkillIds = new Set([...myMap.keys(), ...theirMap.keys()]);

  for (const skillId of allSkillIds) {
    const myProf    = myMap.get(skillId)    || 0;
    const theirProf = theirMap.get(skillId) || 0;
    const bonus     = lookingForSet.has(skillId) ? 1.5 : 1; // boost wanted skills

    intersection += Math.min(myProf, theirProf) * bonus;
    union        += Math.max(myProf, theirProf) * bonus;
  }

  return union === 0 ? 0 : intersection / union;
};

/**
 * Compute availability overlap as a percentage (0 to 1)
 * Compares recurring weekly slots (day_of_week based)
 */
const computeAvailabilityScore = (mySlots, theirSlots) => {
  if (!mySlots.length || !theirSlots.length) return 0;

  let overlapMinutes = 0;
  let totalMinutes   = 0;

  const toMinutes = (timeStr) => {
    const [h, m] = timeStr.split(':').map(Number);
    return h * 60 + m;
  };

  for (const mine of mySlots) {
    const myStart = toMinutes(mine.start_time);
    const myEnd   = toMinutes(mine.end_time);
    totalMinutes += (myEnd - myStart);

    for (const theirs of theirSlots) {
      // must be same day
      const sameDay =
        (mine.day_of_week !== null && mine.day_of_week === theirs.day_of_week) ||
        (mine.specific_date && mine.specific_date === theirs.specific_date);

      if (!sameDay) continue;

      const theirStart = toMinutes(theirs.start_time);
      const theirEnd   = toMinutes(theirs.end_time);

      const overlapStart = Math.max(myStart, theirStart);
      const overlapEnd   = Math.min(myEnd,   theirEnd);

      if (overlapEnd > overlapStart)
        overlapMinutes += (overlapEnd - overlapStart);
    }
  }

  return totalMinutes === 0 ? 0 : Math.min(overlapMinutes / totalMinutes, 1);
};

/**
 * Experience level score — closer levels score higher
 */
const computeExperienceScore = (myLevel, theirLevel) => {
  const levels = { beginner: 1, intermediate: 2, advanced: 3 };
  const diff   = Math.abs((levels[myLevel] || 1) - (levels[theirLevel] || 1));
  return diff === 0 ? 1 : diff === 1 ? 0.5 : 0;
};

/**
 * Seriousness match — exact match scores 1, else 0
 */
const computeSeriousnessScore = (myLevel, theirLevel) =>
  myLevel === theirLevel ? 1 : 0;

/**
 * Main matching function
 * Returns top N candidates sorted by score desc
 */
const getRecommendations = async (userId, hackathonId, limit = 20) => {
  // ── Step 1: get requesting user's data ──────────────
  const [mySkillsRes, myPrefsRes, myAvailRes] = await Promise.all([
    pool.query(
      `SELECT skill_id, proficiency FROM user_skills WHERE user_id = $1`,
      [userId]
    ),
    pool.query(
      `SELECT preferred_role, seriousness_level, looking_for_skills
       FROM user_hackathon_prefs
       WHERE user_id = $1 AND hackathon_id = $2`,
      [userId, hackathonId]
    ),
    pool.query(
      `SELECT day_of_week, specific_date,
              start_time::text, end_time::text
       FROM availability_slots
       WHERE user_id = $1 AND hackathon_id = $2`,
      [userId, hackathonId]
    )
  ]);

  const mySkills       = mySkillsRes.rows;
  const myPrefs        = myPrefsRes.rows[0] || {};
  const mySlots        = myAvailRes.rows;
  const lookingFor     = myPrefs.looking_for_skills || [];
  const mySeriousness  = myPrefs.seriousness_level  || 'serious';

  // get my experience level
  const myUserRes = await pool.query(
    'SELECT experience_level FROM users WHERE id = $1',
    [userId]
  );
  const myLevel = myUserRes.rows[0]?.experience_level || 'beginner';

  // ── Step 2: get all other participants in this hackathon ──
  const candidatesRes = await pool.query(
    `SELECT
       u.id, u.name, u.bio, u.experience_level,
       u.github_url, u.linkedin_url, u.avatar_url,
       u.timezone, u.location,
       uhp.preferred_role, uhp.seriousness_level
     FROM user_hackathon_prefs uhp
     JOIN users u ON u.id = uhp.user_id
     WHERE uhp.hackathon_id = $1
       AND uhp.user_id != $2
       AND u.is_active = TRUE`,
    [hackathonId, userId]
  );

  if (candidatesRes.rows.length === 0) return [];

  const candidateIds = candidatesRes.rows.map(c => c.id);

  // ── Step 3: hard filter — exclude already matched/requested ──
  const excludeRes = await pool.query(
    `SELECT DISTINCT
       CASE WHEN from_user_id = $1 THEN to_user_id ELSE from_user_id END AS excluded_id
     FROM match_requests
     WHERE hackathon_id = $2
       AND status IN ('pending','accepted')
       AND (from_user_id = $1 OR to_user_id = $1)`,
    [userId, hackathonId]
  );
  const excludedIds = new Set(excludeRes.rows.map(r => r.excluded_id));

  // also exclude users already in a full team with me
  const teamExcludeRes = await pool.query(
    `SELECT tm2.user_id as excluded_id
     FROM team_members tm1
     JOIN team_members tm2 ON tm1.team_id = tm2.team_id
     JOIN teams t ON t.id = tm1.team_id
     WHERE tm1.user_id = $1
       AND t.hackathon_id = $2
       AND tm2.user_id != $1`,
    [userId, hackathonId]
  );
  teamExcludeRes.rows.forEach(r => excludedIds.add(r.excluded_id));

  const filteredCandidates = candidatesRes.rows.filter(
    c => !excludedIds.has(c.id)
  );

  if (filteredCandidates.length === 0) return [];

  // ── Step 4: fetch skills + availability for all candidates ──
  const filteredIds = filteredCandidates.map(c => c.id);

  const [allSkillsRes, allAvailRes] = await Promise.all([
    pool.query(
      `SELECT user_id, skill_id, proficiency
       FROM user_skills
       WHERE user_id = ANY($1::uuid[])`,
      [filteredIds]
    ),
    pool.query(
      `SELECT user_id, day_of_week, specific_date,
              start_time::text, end_time::text
       FROM availability_slots
       WHERE user_id = ANY($1::uuid[]) AND hackathon_id = $2`,
      [filteredIds, hackathonId]
    )
  ]);

  // group by user_id for O(1) lookup
  const skillsByUser = {};
  const availByUser  = {};

  for (const row of allSkillsRes.rows) {
    if (!skillsByUser[row.user_id]) skillsByUser[row.user_id] = [];
    skillsByUser[row.user_id].push(row);
  }
  for (const row of allAvailRes.rows) {
    if (!availByUser[row.user_id]) availByUser[row.user_id] = [];
    availByUser[row.user_id].push(row);
  }

  // ── Step 5: score each candidate ─────────────────────
  const scored = filteredCandidates.map(candidate => {
    const theirSkills = skillsByUser[candidate.id] || [];
    const theirSlots  = availByUser[candidate.id]  || [];

    const skillScore       = computeSkillScore(mySkills, theirSkills, lookingFor);
    const availScore       = computeAvailabilityScore(mySlots, theirSlots);
    const expScore         = computeExperienceScore(myLevel, candidate.experience_level);
    const seriousnessScore = computeSeriousnessScore(mySeriousness, candidate.seriousness_level);

    const finalScore = (
      skillScore       * 0.45 +
      availScore       * 0.30 +
      expScore         * 0.15 +
      seriousnessScore * 0.10
    ) * 100;

    // compute matched skill names for UI display
    const theirSkillIds = new Set(theirSkills.map(s => s.skill_id));
    const matchedSkillIds = mySkills
      .filter(s => theirSkillIds.has(s.skill_id))
      .map(s => s.skill_id);

    return {
      user: {
        id:               candidate.id,
        name:             candidate.name,
        bio:              candidate.bio,
        experience_level: candidate.experience_level,
        github_url:       candidate.github_url,
        linkedin_url:     candidate.linkedin_url,
        avatar_url:       candidate.avatar_url,
        timezone:         candidate.timezone,
        location:         candidate.location,
        preferred_role:   candidate.preferred_role,
        skills:           theirSkills
      },
      score:                    parseFloat(finalScore.toFixed(2)),
      matched_skill_ids:        matchedSkillIds,
      availability_overlap_pct: parseFloat((availScore * 100).toFixed(1)),
      skill_score:              parseFloat((skillScore  * 100).toFixed(1)),
    };
  });

  // ── Step 6: sort by score desc, return top N ──────────
  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
};

module.exports = { getRecommendations };
