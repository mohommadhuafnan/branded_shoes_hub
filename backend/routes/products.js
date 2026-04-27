const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Joi = require('joi');
const slugify = require('slugify');
const upload = require('../middleware/upload');
const { protect, adminOnly } = require('../middleware/auth');

const productSchema = Joi.object({
  name: Joi.string().trim().min(2).required(),
  description: Joi.string().allow('').default(''),
  price: Joi.number().min(0).required(),
  salePrice: Joi.number().min(0).allow(null),
  image: Joi.string().allow(''),
  stock: Joi.number().integer().min(0).required(),
  category: Joi.string().allow('').default('Uncategorized'),
  brand: Joi.string().allow('').default('Shoes Hub'),
  sizes: Joi.alternatives().try(Joi.array().items(Joi.string()), Joi.string().allow('')).default([]),
  featured: Joi.boolean().default(false),
  isActive: Joi.boolean().default(true),
  rating: Joi.number().min(0).max(5).default(4.5)
});

// @route   GET /api/products
// @desc    Get all products
router.get('/', async (req, res) => {
  try {
    const page = Math.max(Number(req.query.page || 1), 1);
    const limit = Math.min(Math.max(Number(req.query.limit || 100), 1), 200);
    const search = (req.query.search || '').trim();
    const category = (req.query.category || '').trim();
    const featured = req.query.featured;
    const activeOnly = req.query.activeOnly !== 'false';

    const query = {};
    if (activeOnly) query.isActive = true;
    if (category) query.category = category;
    if (featured === 'true') query.featured = true;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const [products, total] = await Promise.all([
      Product.find(query).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
      Product.countDocuments(query)
    ]);

    res.json({
      data: products,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) || 1 }
    });
  } catch (err) {
    console.error('Error fetching products:', err);
    res.status(500).json({ message: err.message || 'Server error' });
  }
});

// @route   POST /api/products
// @desc    Add a new product
router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const { error, value } = productSchema.validate(req.body, { abortEarly: false });
    if (error) {
      return res.status(400).json({ message: error.details.map((d) => d.message).join(', ') });
    }
    const sizes = Array.isArray(value.sizes)
      ? value.sizes
      : String(value.sizes || '')
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean);

    const slug = slugify(value.name, { lower: true, strict: true });
    const newProduct = new Product({
      ...value,
      sizes,
      slug: `${slug}-${Date.now()}`
    });

    const savedProduct = await newProduct.save();
    res.status(201).json(savedProduct);
  } catch (err) {
    console.error('Error creating product:', err);
    res.status(500).json({ message: err.message || 'Server error' });
  }
});

// @route   PUT /api/products/:id
// @desc    Update a product
router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const { error, value } = productSchema.validate(req.body, { abortEarly: false });
    if (error) {
      return res.status(400).json({ message: error.details.map((d) => d.message).join(', ') });
    }
    const sizes = Array.isArray(value.sizes)
      ? value.sizes
      : String(value.sizes || '')
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean);
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      { $set: { ...value, sizes } },
      { new: true }
    );
    if (!updatedProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(updatedProduct);
  } catch (err) {
    console.error('Error updating product:', err);
    res.status(500).json({ message: err.message || 'Server error' });
  }
});

// @route   DELETE /api/products/:id
// @desc    Delete a product
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Product removed' });
  } catch (err) {
    console.error('Error deleting product:', err);
    res.status(500).json({ message: err.message || 'Server error' });
  }
});

router.post('/upload', protect, adminOnly, upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'Image file is required.' });
  }
  const imageUrl = `/uploads/${req.file.filename}`;
  const absoluteUrl = `${req.protocol}://${req.get('host')}${imageUrl}`;
  res.status(201).json({ imageUrl, absoluteUrl });
});

module.exports = router;
