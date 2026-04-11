const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const connectionRoutes = require('./routes/connections');
const User = require('./models/User');
const Connection = require('./models/Connection');
const Message = require('./models/Message');

const { setupSocketHandlers } = require('./services/socket');

const app = express();
const server = http.createServer(app);

// Security middleware
app.use(helmet());

// Trust proxy for rate limiting
app.set('trust proxy', 1);

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'production'
    ? (parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10) || 100)
    : 2000,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      error: 'Too many requests',
      message: 'Too many requests from this IP, please try again later.'
    });
  }
});
app.use('/api/', limiter);

// CORS configuration
const configuredOrigins = (process.env.CLIENT_URL || 'http://localhost:3000')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const isAllowedOrigin = (origin) => {
  if (configuredOrigins.includes(origin)) {
    return true;
  }

  if (/^https:\/\/[a-z0-9-]+\.vercel\.app$/i.test(origin)) {
    return true;
  }

  if (/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(origin)) {
    return true;
  }

  if (/^https:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(origin)) {
    return true;
  }

  return false;
};

app.use(cors({
  origin: (origin, callback) => {
    // Allow non-browser requests or same-origin requests with no Origin header.
    if (!origin) {
      return callback(null, true);
    }

    // Development should not be blocked by host/origin mismatches between localhost,
    // 127.0.0.1, the LAN IP, or browser tooling.
    if (process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }

    if (isAllowedOrigin(origin)) {
      return callback(null, true);
    }

    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

let connectionPromise = null;

const connectToDatabase = async () => {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (connectionPromise) {
    return connectionPromise;
  }

  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/skillswap';

  connectionPromise = mongoose.connect(mongoUri, {
    serverSelectionTimeoutMS: 30000,
    socketTimeoutMS: 45000
  })
    .then(() => {
      console.log('Connected to MongoDB');
      return mongoose.connection;
    })
    .catch((error) => {
      connectionPromise = null;
      console.error('MongoDB connection error:', error.message);
      throw error;
    });

  return connectionPromise;
};

app.use('/api', async (req, res, next) => {
  try {
    await connectToDatabase();
    next();
  } catch (error) {
    res.status(503).json({
      error: 'Database unavailable',
      message: 'Service temporarily unavailable. Please try again shortly.'
    });
  }
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/connections', connectionRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'SkillSwap API is running',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

const PORT = process.env.PORT || 5000;

if (!process.env.VERCEL) {
  const io = new Server(server, {
    cors: {
      origin: (origin, callback) => {
        if (!origin || process.env.NODE_ENV !== 'production' || isAllowedOrigin(origin)) {
          return callback(null, true);
        }

        return callback(new Error('Not allowed by CORS'));
      },
      credentials: true
    }
  });

  app.set('io', io);
  setupSocketHandlers(io, { User, Connection, Message });

  connectToDatabase()
    .then(() => {
      server.listen(PORT, () => {
        console.log(`SkillSwap server running on port ${PORT}`);
      });
    })
    .catch((error) => {
      console.error('Failed to start server:', error.message);
      process.exit(1);
    });
}

module.exports = app;