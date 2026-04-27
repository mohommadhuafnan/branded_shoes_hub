const express = require('express');
const Joi = require('joi');
const Order = require('../models/Order');
const Product = require('../models/Product');
const stripe = process.env.STRIPE_SECRET_KEY ? require('stripe')(process.env.STRIPE_SECRET_KEY) : null;
const { protect, adminOnly, optionalProtect } = require('../middleware/auth');
const nodemailer = require('nodemailer');

const sendOrderEmail = async (order) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.ethereal.email',
      port: process.env.EMAIL_PORT || 587,
      auth: {
        user: process.env.EMAIL_USER || 'eleonore.mraz@ethereal.email',
        pass: process.env.EMAIL_PASS || 'Y4MpH1YVb65hQkS2T7'
      }
    });

    const info = await transporter.sendMail({
      from: '"Shoes Hub" <no-reply@shoeshub.com>',
      to: order.email || 'customer@example.com',
      subject: `Order Confirmation - ${order._id}`,
      text: `Hello ${order.customerName}, your order has been received! Estimated delivery: ${new Date(order.estimatedDeliveryDate).toLocaleDateString()}. Total: LKR ${order.totalPrice}`,
      html: `<h3>Thank you for your order, ${order.customerName}!</h3><p>Your order <b>${order._id}</b> has been received and is being processed.</p><p>Estimated Delivery: <b>${new Date(order.estimatedDeliveryDate).toLocaleDateString()}</b></p><p>Total: LKR ${order.totalPrice}</p>`
    });
    console.log('Order email sent: %s', info.messageId);
    if (nodemailer.getTestMessageUrl) {
      console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    }
  } catch (error) {
    console.error('Email sending failed:', error);
  }
};

const router = express.Router();

const createOrderSchema = Joi.object({
  customerName: Joi.string().trim().required(),
  customerPhone: Joi.string().allow(''),
  address: Joi.string().allow(''),
  city: Joi.string().allow(''),
  paymentMethod: Joi.string().allow(''),
  items: Joi.array().items(
    Joi.object({
      productId: Joi.string().required(),
      productName: Joi.string().required(),
      size: Joi.string().allow(''),
      quantity: Joi.number().integer().min(1).required(),
      price: Joi.number().min(0).required()
    })
  ).min(1).required(),
  totalPrice: Joi.number().min(0).required()
});

router.post('/', optionalProtect, async (req, res) => {
  const { error, value } = createOrderSchema.validate(req.body, { abortEarly: false });
  if (error) {
    return res.status(400).json({ message: error.details.map((d) => d.message).join(', ') });
  }

  // Calculate estimated delivery (5 days from now)
  const estimatedDeliveryDate = new Date();
  estimatedDeliveryDate.setDate(estimatedDeliveryDate.getDate() + 5);

  const orderData = {
    ...value,
    estimatedDeliveryDate
  };

  if (req.user) {
    orderData.user = req.user._id;
    orderData.email = req.user.email;
  }

  const order = await Order.create(orderData);
  await Promise.all(
    value.items.map((item) =>
      Product.findByIdAndUpdate(item.productId, { $inc: { stock: -item.quantity } }).catch(() => null)
    )
  );

  // Send confirmation email asynchronously
  sendOrderEmail(order);

  res.status(201).json(order);
});

router.post('/create-checkout-session', async (req, res) => {
  try {
    const { totalPrice, customerName } = req.body;
    
    // If stripe is not configured, send a mock response for testing
    if (!process.env.STRIPE_SECRET_KEY) {
      console.log('Stripe is not configured. Simulating successful checkout.');
      return res.json({ url: `${process.env.CLIENT_ORIGIN || 'http://localhost:5173'}?success=true` });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'lkr',
            product_data: {
              name: 'Shoes Hub Order',
              description: `Checkout for ${customerName}`,
            },
            unit_amount: Math.round(totalPrice * 100), // amount in cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.CLIENT_ORIGIN || 'http://localhost:5173'}?success=true`,
      cancel_url: `${process.env.CLIENT_ORIGIN || 'http://localhost:5173'}?canceled=true`,
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error('Stripe error:', error);
    res.status(500).json({ message: error.message });
  }
});

router.get('/myorders', protect, async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json(orders);
});

router.get('/', protect, adminOnly, async (req, res) => {
  const status = (req.query.status || '').trim();
  const query = status ? { status } : {};
  const orders = await Order.find(query).sort({ createdAt: -1 });
  res.json(orders);
});

router.put('/:id/status', protect, adminOnly, async (req, res) => {
  const { status } = req.body;
  const allowed = ['Pending', 'Packed', 'Shipped', 'Delivered', 'Cancelled'];
  if (!allowed.includes(status)) {
    return res.status(400).json({ message: 'Invalid status value.' });
  }
  const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });
  if (!order) return res.status(404).json({ message: 'Order not found.' });
  res.json(order);
});

module.exports = router;
