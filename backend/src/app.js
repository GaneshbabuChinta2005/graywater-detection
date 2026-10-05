const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const errorHandler = require('./middleware/errorHandler');

// Route Imports
const healthRoutes = require('./routes/healthRoutes');
const authRoutes = require('./routes/authRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const analysisRoutes = require('./routes/analysisRoutes');
const telemetryRoutes = require('./routes/telemetryRoutes');
const routingRoutes = require('./routes/routingRoutes');
const storageRoutes = require('./routes/storageRoutes');
const weatherRoutes = require('./routes/weatherRoutes');
const reportRoutes = require('./routes/reportRoutes');
const simulationRoutes = require('./routes/simulationRoutes');

const app = express();

// Security Headers
app.use(helmet({
  crossOriginResourcePolicy: false
}));

// CORS Configuration
const allowedOrigin = process.env.CLIENT_ORIGIN || 'http://localhost:5173';
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, or same-origin)
    if (!origin || origin === allowedOrigin || origin === 'http://localhost:5173' || origin === 'http://127.0.0.1:5173') {
      callback(null, true);
    } else {
      callback(null, true); // Dev flexible fallback
    }
  },
  credentials: true
}));

// Body Parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate Limiting (1000 requests per 15 minutes)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false
});
app.use('/api', limiter);

// Mount API Endpoints
app.use('/api', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/analysis', analysisRoutes);
app.use('/api/telemetry', telemetryRoutes);
app.use('/api/routing', routingRoutes);
app.use('/api/storage', storageRoutes);
app.use('/api/weather', weatherRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/simulation', simulationRoutes);

// Root Health / Info
app.get('/', (req, res) => {
  res.json({
    name: 'Greywater AI Management API Gateway',
    version: '1.0.0',
    documentation: '/api/health'
  });
});

// Global Error Handler
app.use(errorHandler);

module.exports = app;
