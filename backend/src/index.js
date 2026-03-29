require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const compression = require('compression');
const path = require('path');
const connectDB = require('./config/db');

const authRoutes     = require('./routes/auth');
const verifyRoutes   = require('./routes/verify');
const adminRoutes    = require('./routes/admin');
const postsRoutes    = require('./routes/posts');
const messagesRoutes = require('./routes/messages');
const commentsRoutes = require('./routes/comments');
const recruiterRoutes = require('./routes/recruiter');
const aiRoutes       = require('./routes/ai');
const usersRoutes    = require('./routes/users');

const app = express();

// ─── Security Middleware ──────────────────────────────────────────────────────
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }, // allow uploads to be served
}));

// CORS — restrict to known origins in production
const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:5173').split(',');
app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    cb(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));

// ─── Global Rate Limiter ──────────────────────────────────────────────────────
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { msg: 'Too many requests, please try again later.' },
});

app.use(globalLimiter);

// ─── General Middleware ───────────────────────────────────────────────────────
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// ─── Static Files ─────────────────────────────────────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// ─── Database ─────────────────────────────────────────────────────────────────
connectDB();

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/auth',      authRoutes);
app.use('/api/verify',    verifyRoutes);
app.use('/api/admin',     adminRoutes);
app.use('/api/posts',     postsRoutes);
app.use('/api/messages',  messagesRoutes);
app.use('/api/comments',  commentsRoutes);
app.use('/api/recruiter', recruiterRoutes);
app.use('/api/ai',        aiRoutes);
app.use('/api/users',     usersRoutes);

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

// ─── 404 Handler ──────────────────────────────────────────────────────────────
app.use((req, res) => res.status(404).json({ msg: 'Route not found' }));

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('❌ Unhandled error:', err.message);
  res.status(err.status || 500).json({ msg: err.message || 'Internal server error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`));
