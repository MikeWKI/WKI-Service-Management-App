const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const compression = require("compression");
require("dotenv").config();
const mongoose = require('mongoose');
const { 
  rateLimiters, 
  securityHeaders, 
  requestLogger, 
  errorHandler, 
  notFoundHandler 
} = require('./middleware/security');
const serviceCasesRouter = require('./routes/serviceCases');
const locationMetricsRouter = require('./routes/locationMetrics');

const app = express();

// FIX: Trust first proxy (required for Render.com) - MUST be before rate limiters
app.set('trust proxy', 1);

// Connect to MongoDB
const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/service-management';
mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Security middleware
app.use(securityHeaders);
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || "http://localhost:3000",
    "https://wki-sma.onrender.com"
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate limiting (now works correctly with trust proxy setting)
app.use('/api/', rateLimiters.api);
app.use(rateLimiters.general);

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Compression middleware
app.use(compression());

// Logging middleware
app.use(morgan("combined"));
app.use(requestLogger);

// API Routes
app.get("/api/health", (req, res) => {
  res.json({ 
    status: "OK", 
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || "1.0.0",
    environment: process.env.NODE_ENV || "development"
  });
});

// Service Management routes
app.use('/api/service-cases', serviceCasesRouter);
app.use('/api/locationMetrics', locationMetricsRouter);

// Middleware must be after routes
app.use(errorHandler);
app.use("*", notFoundHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Frontend URL: ${process.env.FRONTEND_URL || "http://localhost:3000"}`);
  console.log(`Trust proxy enabled: ${app.get('trust proxy')}`);
});