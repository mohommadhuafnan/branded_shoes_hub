const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Order = require('../models/Order');
const SiteContent = require('../models/SiteContent');
const { protect, adminOnly } = require('../middleware/auth');

// @route   GET /api/admin/dashboard
// @desc    Get dashboard analytics
router.get('/dashboard', protect, adminOnly, async (req, res) => {
  try {
    const totalProducts = await Product.countDocuments();
    const products = await Product.find({}, 'stock');
    let availableProducts = 0;
    products.forEach(p => {
      availableProducts += p.stock;
    });

    const totalOrders = await Order.countDocuments();
    const orders = await Order.find();
    let totalSales = 0;
    let todaySales = 0;
    let monthSales = 0;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

    orders.forEach(order => {
      totalSales += order.totalPrice;
      if (new Date(order.createdAt) >= today) {
        todaySales += order.totalPrice;
      }
      if (new Date(order.createdAt) >= monthStart) {
        monthSales += order.totalPrice;
      }
    });

    const lowStockCount = await Product.countDocuments({ stock: { $lte: 5 } });

    res.json({
      totalProducts,
      availableProducts,
      totalSales,
      todaySales,
      monthSales,
      totalOrders,
      lowStockCount
    });

  } catch (err) {
    console.error('Dashboard Error:', err);
    res.status(500).json({ message: err.message || 'Server error' });
  }
});

router.get('/content', protect, adminOnly, async (_req, res) => {
  let content = await SiteContent.findOne();
  if (!content) content = await SiteContent.create({});
  res.json(content);
});

router.put('/content', protect, adminOnly, async (req, res) => {
  const payload = { ...req.body, updatedAt: new Date() };
  const content = await SiteContent.findOneAndUpdate({}, payload, { upsert: true, new: true });
  res.json(content);
});

module.exports = router;
