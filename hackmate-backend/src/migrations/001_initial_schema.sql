CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─────────────────────────────────────────
-- USERS
-- ─────────────────────────────────────────
CREATE TABLE users (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name             VARCHAR(100) NOT NULL,
  email            VARCHAR(255) UNIQUE NOT NULL,
  password_hash    VARCHAR(255) NOT NULL,
  bio              TEXT,
  github_url       VARCHAR(255),
  linkedin_url     VARCHAR(255),
  timezone         VARCHAR(50)  DEFAULT 'Asia/Kolkata',
  location         VARCHAR(100),
  experience_level VARCHAR(20)  CHECK (experience_level IN ('beginner','intermediate','advanced')) DEFAULT 'beginner',
  avatar_url       VARCHAR(255),
  is_active        BOOLEAN      DEFAULT TRUE,
  created_at       TIMESTAMPTZ  DEFAULT NOW(),
  updated_at       TIMESTAMPTZ  DEFAULT NOW()
);

-- ─────────────────────────────────────────
-- REFRESH TOKENS
-- ─────────────────────────────────────────
CREATE TABLE refresh_tokens (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token      TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────
-- SKILLS MASTER
-- ─────────────────────────────────────────
CREATE TABLE skills (
  id       SERIAL PRIMARY KEY,
  name     VARCHAR(100) UNIQUE NOT NULL,
  category VARCHAR(50) CHECK (category IN (
             'frontend','backend','mobile','devops',
             'ml_ai','database','design','other'))
);

-- ─────────────────────────────────────────
-- USER SKILLS
-- ─────────────────────────────────────────
CREATE TABLE user_skills (
  id               SERIAL PRIMARY KEY,
  user_id          UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  skill_id         INT  NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
  proficiency      SMALLINT CHECK (proficiency BETWEEN 1 AND 5) DEFAULT 1,
  years_experience NUMERIC(4,1) DEFAULT 0,
  UNIQUE (user_id, skill_id)
);

-- ─────────────────────────────────────────
-- HACKATHONS  (seeded manually, read-only via API)
-- ─────────────────────────────────────────
CREATE TABLE hackathons (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name          VARCHAR(200) NOT NULL,
  description   TEXT,
  start_date    DATE NOT NULL,
  end_date      DATE NOT NULL,
  mode          VARCHAR(20) CHECK (mode IN ('online','offline','hybrid')) DEFAULT 'online',
  location      VARCHAR(200),
  max_team_size SMALLINT DEFAULT 4,
  min_team_size SMALLINT DEFAULT 2,
  tech_focus    TEXT[],
  website_url   VARCHAR(255),
  is_active     BOOLEAN DEFAULT TRUE,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────
-- USER ↔ HACKATHON PREFERENCES
-- ─────────────────────────────────────────
CREATE TABLE user_hackathon_prefs (
  id                  SERIAL PRIMARY KEY,
  user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  hackathon_id        UUID NOT NULL REFERENCES hackathons(id) ON DELETE CASCADE,
  preferred_role      VARCHAR(50),
  seriousness_level   VARCHAR(20) CHECK (seriousness_level IN ('casual','serious','win_focused')) DEFAULT 'serious',
  looking_for_skills  INT[],           -- skill IDs they want in teammates
  joined_at           TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, hackathon_id)
);

-- ─────────────────────────────────────────
-- AVAILABILITY SLOTS
-- ─────────────────────────────────────────
CREATE TABLE availability_slots (
  id            SERIAL PRIMARY KEY,
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  hackathon_id  UUID NOT NULL REFERENCES hackathons(id) ON DELETE CASCADE,
  day_of_week   SMALLINT CHECK (day_of_week BETWEEN 0 AND 6),
  specific_date DATE,
  start_time    TIME NOT NULL,
  end_time      TIME NOT NULL,
  timezone      VARCHAR(50) DEFAULT 'Asia/Kolkata',
  CHECK (end_time > start_time),
  CHECK (
    (day_of_week IS NOT NULL AND specific_date IS NULL) OR
    (day_of_week IS NULL     AND specific_date IS NOT NULL)
  )
);

-- ─────────────────────────────────────────
-- TEAMS
-- ─────────────────────────────────────────
CREATE TABLE teams (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hackathon_id UUID NOT NULL REFERENCES hackathons(id) ON DELETE CASCADE,
  name         VARCHAR(200),
  status       VARCHAR(20) CHECK (status IN ('forming','full','disbanded')) DEFAULT 'forming',
  created_by   UUID REFERENCES users(id),
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────
-- TEAM MEMBERS
-- ─────────────────────────────────────────
CREATE TABLE team_members (
  id        SERIAL PRIMARY KEY,
  team_id   UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  user_id   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role      VARCHAR(50),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (team_id, user_id)
);

-- ─────────────────────────────────────────
-- MATCH REQUESTS
-- ─────────────────────────────────────────
CREATE TABLE match_requests (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  from_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  to_user_id   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  hackathon_id UUID NOT NULL REFERENCES hackathons(id) ON DELETE CASCADE,
  team_id      UUID REFERENCES teams(id) ON DELETE SET NULL,
  status       VARCHAR(20) CHECK (status IN ('pending','accepted','rejected','expired','cancelled')) DEFAULT 'pending',
  message      TEXT,
  expires_at   TIMESTAMPTZ DEFAULT NOW() + INTERVAL '3 days',
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (from_user_id, to_user_id, hackathon_id)   -- no duplicate requests
);

-- ─────────────────────────────────────────
-- CONVERSATIONS
-- ─────────────────────────────────────────
CREATE TABLE conversations (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type       VARCHAR(20) CHECK (type IN ('direct','team')) DEFAULT 'direct',
  team_id    UUID REFERENCES teams(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE conversation_participants (
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  joined_at       TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (conversation_id, user_id)
);

-- ─────────────────────────────────────────
-- MESSAGES
-- ─────────────────────────────────────────
CREATE TABLE messages (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content         TEXT NOT NULL,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  read_at         TIMESTAMPTZ
);

-- ─────────────────────────────────────────
-- INDEXES
-- ─────────────────────────────────────────
CREATE INDEX idx_user_skills_user        ON user_skills(user_id);
CREATE INDEX idx_user_skills_skill       ON user_skills(skill_id);
CREATE INDEX idx_user_hack_prefs         ON user_hackathon_prefs(hackathon_id);
CREATE INDEX idx_availability_user_hack  ON availability_slots(user_id, hackathon_id);
CREATE INDEX idx_match_req_to            ON match_requests(to_user_id, status);
CREATE INDEX idx_match_req_from          ON match_requests(from_user_id, status);
CREATE INDEX idx_messages_convo          ON messages(conversation_id, created_at DESC);
CREATE INDEX idx_team_members_user       ON team_members(user_id);
