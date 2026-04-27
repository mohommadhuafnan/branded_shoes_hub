require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  const email = process.env.SEED_ADMIN_EMAIL || 'admin@shoeshub.com';
  const password = process.env.SEED_ADMIN_PASSWORD || 'Admin@123';

  const existing = await User.findOne({ email });
  if (existing) {
    existing.role = 'admin';
    existing.password = password;
    await existing.save();
    console.log('Updated existing admin user:', email);
  } else {
    await User.create({
      name: 'Shoes Hub Admin',
      email,
      password,
      role: 'admin'
    });
    console.log('Created admin user:', email);
  }

  await mongoose.disconnect();
}

run().catch(async (error) => {
  console.error(error);
  await mongoose.disconnect();
  process.exit(1);
});
