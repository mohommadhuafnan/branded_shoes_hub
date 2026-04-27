const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  email: { type: String, default: '' },
  customerName: { type: String, required: true },
  customerPhone: { type: String, default: '' },
  address: { type: String, default: '' },
  city: { type: String, default: '' },
  totalPrice: { type: Number, required: true },
  paymentMethod: { type: String, default: 'cod' },
  items: [
    {
      productId: String,
      productName: String,
      size: String,
      quantity: Number,
      price: Number
    }
  ],
  status: { type: String, enum: ['Pending', 'Packed', 'Shipped', 'Delivered', 'Cancelled'], default: 'Pending' },
  estimatedDeliveryDate: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', OrderSchema);
