const express = require('express');
const mongoose = require('mongoose');
const dns = require('node:dns');
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
const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
const dnsServers = String(process.env.MONGODB_DNS_SERVERS || '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);
const clientOptions = {
  serverApi: { version: '1', strict: true, deprecationErrors: true },
  serverSelectionTimeoutMS: 15000
};

const startServer = async () => {
  try {
    if (!mongoUri) {
      throw new Error('Missing MONGODB_URI (or legacy MONGO_URI) environment variable');
    }
    if (dnsServers.length > 0) {
      dns.setServers(dnsServers);
      console.log('Using custom DNS servers for MongoDB SRV lookup:', dnsServers.join(', '));
    }

    await mongoose.connect(mongoUri, clientOptions);
    console.log('MongoDB successfully connected');

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    if (String(err?.message || '').includes('querySrv')) {
      console.error(
        'MongoDB SRV DNS lookup failed. Set MONGODB_DNS_SERVERS=8.8.8.8,1.1.1.1 in backend/.env and restart.'
      );
    }
    console.error('MongoDB connection error:', err.message || err);
    process.exit(1);
  }
};

startServer();
