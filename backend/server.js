const express = require('express');
const connectDB = require('./config/db');
const { elasticClient, createIndex, setupPropertyMappings } = require('./config/elasticsearch');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');

// Load env vars
require('dotenv').config();

// Connect to database
connectDB();

// Initialize Elasticsearch
(async () => {
  await createIndex('properties');
  await setupPropertyMappings();
})();

// Route files
const auth = require('./routes/auth');
const properties = require('./routes/properties');
const admin = require('./routes/admin');

const app = express();

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Dev logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Enable CORS
app.use(cors());

// Set security headers
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 mins
  max: 100,
});
app.use(limiter);

// Mount routers
app.use('/api/auth', auth);
app.use('/api/properties', properties);
app.use('/api/admin', admin);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: 'Server Error',
  });
});

const PORT = process.env.PORT || 5000;

const server = app.listen(
  PORT,
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`)
);

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});