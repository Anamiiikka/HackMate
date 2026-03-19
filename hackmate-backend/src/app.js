const express    = require('express');
const helmet     = require('helmet');
const cors       = require('cors');
const rateLimit  = require('express-rate-limit');
const swaggerUi  = require('swagger-ui-express');
const YAML       = require('yamljs');
const path       = require('path');
require('dotenv').config();

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL || '*' }));
app.use(express.json());

app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { error: 'Too many requests.' }
}));

// Health check
app.get('/health', (req, res) =>
  res.json({ status: 'ok', timestamp: new Date() })
);

// Swagger docs
const spec = YAML.load(path.join(__dirname, 'docs/openapi.yaml'));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(spec));

// Routes
app.use('/api/v1/auth',       require('./routes/auth'));
app.use('/api/v1/users',      require('./routes/users'));
app.use('/api/v1/hackathons', require('./routes/hackathons'));
app.use('/api/v1/hackathons', require('./routes/matching'));
// app.use('/api/v1/requests',      require('./routes/requests'));
// app.use('/api/v1/conversations', require('./routes/conversations'));

app.use((req, res) => res.status(404).json({ error: 'Route not found' }));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`🚀 HackMate running → http://localhost:${PORT}`)
);
