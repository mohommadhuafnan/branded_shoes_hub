const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true, index: true },
  description: { type: String, default: '' },
  price: { type: Number, required: true },
  salePrice: { type: Number, default: null },
  image: { type: String, default: '' },
  images: [{ type: String }],
  stock: { type: Number, required: true, default: 0 },
  category: { type: String, default: 'Uncategorized' },
  brand: { type: String, default: 'Shoes Hub' },
  sizes: [{ type: String }],
  isActive: { type: Boolean, default: true },
  featured: { type: Boolean, default: false },
  rating: { type: Number, default: 4.5, min: 0, max: 5 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Product', ProductSchema);
