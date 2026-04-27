const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const adminRoutes = require('./routes/admin');
const orderRoutes = require('./routes/orders');
const contentRoutes = require('./routes/content');

const app = express();

// Middleware
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || '*'
  })
);
app.use(morgan('dev'));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 250 }));
app.use(express.json()); // Parse JSON bodies
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/content', contentRoutes);
app.get('/api/health', (_req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 5000;
const clientOptions = {
  serverApi: { version: '1', strict: true, deprecationErrors: true },
  serverSelectionTimeoutMS: 15000
};

const startServer = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, clientOptions);
    console.log('MongoDB successfully connected');

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('MongoDB connection error:', err.message || err);
    process.exit(1);
  }
};

startServer();
