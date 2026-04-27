const mongoose = require('mongoose');

const SiteContentSchema = new mongoose.Schema({
  heroTitle: { type: String, default: 'New Season Drops' },
  heroDescription: { type: String, default: 'Fresh styles, limited stock. Grab your size now.' },
  heroTag: { type: String, default: 'Up to 25% off' },
  promoTitle: { type: String, default: 'New season arrivals with premium comfort and sharp street style.' },
  promoDescription: { type: String, default: 'Use the filters on each page to sort by price, size, rating, and sale items.' },
  whatsappNumber: { type: String, default: '' },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('SiteContent', SiteContentSchema);
