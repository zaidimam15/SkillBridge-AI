require('dotenv').config();
require('express-async-errors');

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const mongoSanitize = require('express-mongo-sanitize');
const rateLimit = require('express-rate-limit');
const path = require('path');

const connectDB = require('./config/database');
const logger = require('./config/logger');
const errorHandler = require('./middleware/errorHandler');

// ============================================================
// ROUTE IMPORTS
// ============================================================

const authRoutes = require('./routes/auth');
const resumeRoutes = require('./routes/resumes');
const jobRoutes = require('./routes/jobs');
const analysisRoutes = require('./routes/analysis');
const skillRoutes = require('./routes/skills');
const resourceRoutes = require('./routes/resources');
const roadmapRoutes = require('./routes/roadmap');
const projectRoutes = require('./routes/projects');

// CAREER ROUTE
const careerRoutes = require('./routes/careers');

const recruiterRoutes = require('./routes/recruiter');
const adminRoutes = require('./routes/admin');
const notificationRoutes = require('./routes/notifications');
const profileRoutes = require('./routes/profile');

// ============================================================
// APP INITIALIZATION
// ============================================================

const app = express();

// ============================================================
// TRUST PROXY
// ============================================================

app.set('trust proxy', 1);

// ============================================================
// SECURITY HEADERS
// ============================================================

app.use(
  helmet({
    crossOriginResourcePolicy: {
      policy: 'cross-origin',
    },
  })
);

// ============================================================
// CORS
// ============================================================

app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
    methods: [
      'GET',
      'POST',
      'PUT',
      'DELETE',
      'PATCH',
      'OPTIONS',
    ],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
    ],
  })
);

// ============================================================
// RATE LIMITING
// ============================================================

const limiter = rateLimit({
  windowMs:
    parseInt(process.env.RATE_LIMIT_WINDOW_MS) ||
    15 * 60 * 1000,

  max:
    parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) ||
    100,

  message: {
    success: false,
    message:
      'Too many requests from this IP. Please try again later.',
  },

  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);

// ============================================================
// BODY PARSING
// ============================================================

app.use(
  express.json({
    limit: '10mb',
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: '10mb',
  })
);

// ============================================================
// NOSQL INJECTION PROTECTION
// ============================================================

app.use(mongoSanitize());

// ============================================================
// COMPRESSION
// ============================================================

app.use(compression());

// ============================================================
// HTTP REQUEST LOGGING
// ============================================================

if (process.env.NODE_ENV !== 'test') {
  app.use(
    morgan('dev', {
      stream: {
        write: (msg) => logger.http(msg.trim()),
      },
    })
  );
}

// ============================================================
// STATIC UPLOADS
// ============================================================

app.use(
  '/uploads',
  express.static(
    path.join(__dirname, '../uploads')
  )
);

// ============================================================
// HEALTH CHECK
// ============================================================

app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'SkillBridge AI API is running',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// ============================================================
// API ROUTES
// ============================================================

app.use('/api/auth', authRoutes);

app.use('/api/resumes', resumeRoutes);

app.use('/api/jobs', jobRoutes);

app.use('/api/analysis', analysisRoutes);

app.use('/api/skills', skillRoutes);

app.use('/api/resources', resourceRoutes);

app.use('/api/roadmap', roadmapRoutes);

app.use('/api/projects', projectRoutes);

// ============================================================
// CAREER PATHWAYS
// ============================================================
// Personalized career recommendations based on the user's
// successfully parsed resume and extracted skills.
// ============================================================

app.use('/api/careers', careerRoutes);

app.use('/api/recruiter', recruiterRoutes);

app.use('/api/admin', adminRoutes);

app.use('/api/notifications', notificationRoutes);

app.use('/api/profile', profileRoutes);

// ============================================================
// 404 HANDLER
// ============================================================

app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

// ============================================================
// GLOBAL ERROR HANDLER
// ============================================================

app.use(errorHandler);

const { ensureAIServiceRunning } = require('./services/aiServiceManager');

// ============================================================
// START SERVER
// ============================================================

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Connect MongoDB first
    await connectDB();

    // Ensure AI NLP service is active
    await ensureAIServiceRunning();

    // Start Express server
    app.listen(PORT, () => {
      logger.info(
        `🚀 SkillBridge AI Server running on port ${PORT}`
      );

      logger.info(
        `🌍 Environment: ${process.env.NODE_ENV || 'development'}`
      );

      logger.info(
        `📡 API: http://localhost:${PORT}/api`
      );

      logger.info(
        `❤️ Health: http://localhost:${PORT}/api/health`
      );

      logger.info(
        `💼 Careers: http://localhost:${PORT}/api/careers`
      );
    });
  } catch (error) {
    logger.error(
      '❌ Failed to start server:',
      error
    );

    process.exit(1);
  }
};

if (process.env.NODE_ENV !== 'test') {
  startServer();
}

// ============================================================
// EXPORT
// ============================================================

module.exports = app;