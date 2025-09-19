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
mongoose.connect(mongoUri)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Security middleware
app.use(securityHeaders);
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || "http://localhost:3000",
    "https://wki-sma.onrender.com",
    "https://wki-service-management-app.onrender.com" // Allow backend to call itself
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  optionsSuccessStatus: 200 // For legacy browser support
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

// Health Check Endpoints (for Render monitoring)

// Primary health check endpoint for Render (comprehensive)
app.get("/health", async (req, res) => {
  try {
    console.log(`🏥 Health check requested at ${new Date().toISOString()}`);
    console.log(`   MongoDB readyState: ${mongoose.connection.readyState}`);
    
    const healthCheck = {
      status: "OK",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || "development",
      version: process.env.npm_package_version || "1.0.0",
      service: "WKI Service Management Backend",
      checks: {
        database: "OK",
        memory: "OK"
      },
      details: {
        uptime: `${Math.floor(process.uptime())} seconds`,
        nodeVersion: process.version,
        platform: process.platform
      }
    };

    // Check MongoDB connection
    try {
      // Use a more reliable MongoDB ping method
      if (mongoose.connection.readyState === 1) {
        // Connection is open - try a simple ping
        await mongoose.connection.db.admin().ping();
        healthCheck.checks.database = "OK";
        healthCheck.details.database = {
          status: "Connected",
          readyState: mongoose.connection.readyState,
          name: mongoose.connection.name
        };
      } else {
        // Connection is not ready
        throw new Error(`MongoDB connection not ready. ReadyState: ${mongoose.connection.readyState}`);
      }
    } catch (dbError) {
      console.error('Health check - Database error:', dbError);
      // Don't fail health check for database issues - just mark as degraded
      healthCheck.checks.database = "DEGRADED";
      healthCheck.status = "DEGRADED";
      healthCheck.details.database = {
        status: "Disconnected or Error",
        readyState: mongoose.connection.readyState,
        error: dbError.message
      };
    }

    // Check memory usage
    const memUsage = process.memoryUsage();
    const memUsagePercent = (memUsage.heapUsed / memUsage.heapTotal) * 100;
    
    if (memUsagePercent > 90) {
      healthCheck.checks.memory = "WARNING";
      healthCheck.status = "DEGRADED";
    }
    
    healthCheck.details.memory = {
      heapUsed: `${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`,
      heapTotal: `${Math.round(memUsage.heapTotal / 1024 / 1024)}MB`,
      usagePercent: `${Math.round(memUsagePercent)}%`
    };

    // Return appropriate status code for Render
    // Return 200 for OK or DEGRADED (service still functional)
    // Return 503 only for complete ERROR state
    const statusCode = healthCheck.status === "ERROR" ? 503 : 200;
    res.status(statusCode).json(healthCheck);

  } catch (error) {
    console.error('Health check error:', error);
    res.status(503).json({
      status: "ERROR",
      timestamp: new Date().toISOString(),
      service: "WKI Service Management Backend",
      error: error.message
    });
  }
});

// Readiness check (for container orchestration)
app.get("/ready", async (req, res) => {
  try {
    // Check if MongoDB is ready
    await mongoose.connection.db.admin().ping();
    res.status(200).json({ 
      status: "ready",
      timestamp: new Date().toISOString(),
      service: "WKI Service Management Backend"
    });
  } catch (error) {
    console.error('Readiness check failed:', error);
    res.status(503).json({ 
      status: "not ready", 
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Liveness check (simple check that service is running)
app.get("/live", (req, res) => {
  res.status(200).json({ 
    status: "alive",
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Metrics endpoint (for monitoring and debugging)
app.get("/metrics", (req, res) => {
  const metrics = {
    service: "WKI Service Management Backend",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: {
      rss: `${Math.round(process.memoryUsage().rss / 1024 / 1024)}MB`,
      heapTotal: `${Math.round(process.memoryUsage().heapTotal / 1024 / 1024)}MB`,
      heapUsed: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`,
      external: `${Math.round(process.memoryUsage().external / 1024 / 1024)}MB`
    },
    cpu: process.cpuUsage(),
    version: process.env.npm_package_version || "1.0.0",
    environment: process.env.NODE_ENV || "development",
    nodeVersion: process.version,
    platform: process.platform,
    database: {
      readyState: mongoose.connection.readyState,
      host: mongoose.connection.host,
      name: mongoose.connection.name
    }
  };
  res.json(metrics);
});

// API Routes

// Legacy health check endpoint (keep for backward compatibility)
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