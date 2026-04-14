const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  customerName:    { type: String, required: true, trim: true },
  phone:           { type: String, required: true, trim: true },
  pickupAddress:   { type: String, required: true, trim: true },
  deliveryAddress: { type: String, required: true, trim: true },
  parcelType: {
    type: String,
    enum: ['Document', 'Package', 'Fragile', 'Electronics', 'Clothing', 'Food', 'Other'],
    required: true,
  },
  weight:       { type: Number, required: true },
  description:  { type: String, default: '' },
  status: {
    type: String,
    enum: ['Pending', 'Shipped', 'Out for Delivery', 'Delivered'],
    default: 'Pending',
  },
  orderId: { type: String, unique: true },
}, { timestamps: true });

// Auto-generate orderId before saving
orderSchema.pre('save', async function (next) {
  if (!this.orderId) {
    this.orderId = 'ORD' + Date.now().toString().slice(-8) + Math.floor(Math.random() * 100);
  }
  next();
});

module.exports = mongoose.model('Order', orderSchema);
