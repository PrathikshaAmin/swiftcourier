/**
 * Run once: node seedAdmin.js
 * Creates the predefined admin account
 */
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();
const User = require('./models/User');

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  const exists = await User.findOne({ email: 'admin@swiftcourier.com' });
  if (exists) {
    console.log('Admin already exists:', exists.email);
  } else {
    const hashed = await bcrypt.hash('admin123', 10);
    await User.create({ name: 'Admin', email: 'admin@swiftcourier.com', password: hashed, role: 'admin' });
    console.log('✅ Admin created  →  admin@swiftcourier.com  /  admin123');
  }
  await mongoose.disconnect();
}

seed().catch(console.error);
