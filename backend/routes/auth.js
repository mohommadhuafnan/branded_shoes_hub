const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// Generate JWT token (include role so Vercel serverless routes can authorize admin without Mongo)
const generateToken = (user) => {
  return jwt.sign(
    { id: String(user._id), role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '30d' }
  );
};

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', async (req, res) => {
  const { name, email, password, adminSetupKey } = req.body;

  try {
    let user = await User.findOne({ email });

    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    user = new User({
      name,
      email,
      password,
      role: adminSetupKey && adminSetupKey === process.env.ADMIN_SETUP_KEY ? 'admin' : 'customer'
    });

    await user.save();

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user)
    });
  } catch (err) {
    console.error('Registration Error:', err);
    res.status(500).json({ message: err.message || 'Server error' });
  }
});

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: 'Invalid Credentials' });
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid Credentials' });
    }

    if (user.role === 'admin') {
      return res.status(403).json({ message: 'Please use Admin Login for admin account.' });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user)
    });
  } catch (err) {
    console.error('Login Error:', err);
    res.status(500).json({ message: err.message || 'Server error' });
  }
});

// @route   POST /api/auth/admin-login
// @desc    Authenticate admin only
// @access  Public
router.post('/admin-login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid Credentials' });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid Credentials' });

    if (user.role !== 'admin') {
      return res.status(403).json({ message: 'This account is not an admin account.' });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user)
    });
  } catch (err) {
    console.error('Admin Login Error:', err);
    res.status(500).json({ message: err.message || 'Server error' });
  }
});

// @route   POST /api/auth/forgot-password
// @desc    Mock forgot password route
// @access  Public
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  
  try {
    const user = await User.findOne({ email });
    if (!user) {
      // For security, often returns success even if user doesn't exist
      return res.status(200).json({ message: 'If that email exists, a reset link will be sent.' });
    }
    
    // In a real app, generate a reset token and send an email here.
    res.status(200).json({ message: 'Password reset link has been sent to your email.' });
  } catch (err) {
    console.error('Forgot PW Error:', err);
    res.status(500).json({ message: err.message || 'Server error' });
  }
});

router.get('/me', protect, async (req, res) => {
  res.json({
    _id: req.user._id,
    name: req.user.name,
    email: req.user.email,
    role: req.user.role
  });
});

module.exports = router;
