-- Skills
INSERT INTO skills (name, category) VALUES
  ('React',         'frontend'),
  ('Vue.js',        'frontend'),
  ('Next.js',       'frontend'),
  ('Angular',       'frontend'),
  ('Node.js',       'backend'),
  ('Express',       'backend'),
  ('Django',        'backend'),
  ('FastAPI',       'backend'),
  ('Spring Boot',   'backend'),
  ('PostgreSQL',    'database'),
  ('MongoDB',       'database'),
  ('Redis',         'database'),
  ('MySQL',         'database'),
  ('Docker',        'devops'),
  ('Kubernetes',    'devops'),
  ('AWS',           'devops'),
  ('GCP',           'devops'),
  ('TensorFlow',    'ml_ai'),
  ('PyTorch',       'ml_ai'),
  ('LangChain',     'ml_ai'),
  ('Figma',         'design'),
  ('Flutter',       'mobile'),
  ('React Native',  'mobile'),
  ('Solidity',      'other'),
  ('Rust',          'other'),
  ('Go',            'backend'),
  ('GraphQL',       'backend'),
  ('TypeScript',    'frontend');

-- Hackathons (you manage these directly in DB)
INSERT INTO hackathons (name, description, start_date, end_date, mode, max_team_size, tech_focus, website_url) VALUES
(
  'HackIndia 2026',
  'India''s biggest 48-hour online hackathon',
  '2026-04-15', '2026-04-17',
  'online', 4,
  ARRAY['AI','Web','Blockchain'],
  'https://hackindia.xyz'
),
(
  'Smart India Hackathon 2026',
  'Government of India national hackathon',
  '2026-08-01', '2026-08-03',
  'offline', 6,
  ARRAY['GovTech','AI','IoT'],
  'https://sih.gov.in'
),
(
  'ETHIndia 2026',
  'India''s largest Ethereum hackathon',
  '2026-11-10', '2026-11-12',
  'offline', 5,
  ARRAY['Blockchain','Web3','DeFi'],
  'https://ethindia.co'
);
