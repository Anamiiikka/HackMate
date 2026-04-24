require('dotenv').config();
const express    = require('express');
const http       = require('http');
const { Server } = require('socket.io');
const helmet     = require('helmet');
const cors       = require('cors');
const rateLimit  = require('express-rate-limit');
const swaggerUi  = require('swagger-ui-express');
const YAML       = require('yamljs');
const path       = require('path');

const setupSocket = require('./socket/chatSocket');
const requestRoutes = require('./routes/requests');
const matchingRoutes = require('./routes/matching');
const conversationRoutes = require('./routes/conversations');
const teamRoutes = require('./routes/teams');
const notificationRoutes = require('./routes/notifications');

const app    = express();
const server = http.createServer(app);         // raw http server
const io     = new Server(server, {
  cors: {
    origin:  process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE']
  }
});

// ── Middleware ────────────────────────────────────────
// CORS must be before helmet so OPTIONS preflight responses aren't blocked
const corsOptions = {
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};
app.use(cors(corsOptions));
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use((req, res, next) => {
  console.log(`📨 ${req.method} ${req.path}`);
  next();
});
app.use(express.json());
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { error: 'Too many requests.' }
}));

// ── Health check ──────────────────────────────────────
app.get('/health', (req, res) =>
  res.json({ status: 'ok', timestamp: new Date() })
);

// ── Swagger ───────────────────────────────────────────
const spec = YAML.load(path.join(__dirname, 'docs/openapi.yaml'));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(spec));

// ── REST Routes ───────────────────────────────────────
app.use('/api/v1/auth',          require('./routes/auth'));
app.use('/api/v1/users',         require('./routes/users'));
app.use('/api/v1/hackathons',    require('./routes/hackathons'));
app.use('/api/v1/hackathons',    require('./routes/matching'));
app.use('/api/v1/requests',      require('./routes/requests'));
app.use('/api/v1/conversations', require('./routes/conversations'));
app.use('/api/v1/teams', teamRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/admin',         require('./routes/admin'));

// ── WebSocket ─────────────────────────────────────────
setupSocket(io);

// ── Error handlers ────────────────────────────────────
app.use((req, res) => res.status(404).json({ error: 'Route not found' }));
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Global error: ' + err.message + '\n' + err.stack });
});

// ── Start server (use server.listen not app.listen) ───
const PORT = process.env.PORT || 5000;
server.listen(PORT, () =>
  console.log(`🚀 HackMate running → http://localhost:${PORT}`)
);
