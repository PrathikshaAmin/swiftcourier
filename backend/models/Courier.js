const mongoose = require('mongoose');

const statusHistorySchema = new mongoose.Schema({
  status:    { type: String },
  timestamp: { type: Date, default: Date.now },
}, { _id: false });

const courierSchema = new mongoose.Schema({
  trackingId:      { type: String, required: true, unique: true },
  senderName:      { type: String, required: true },
  receiverName:    { type: String, required: true },
  pickupAddress:   { type: String, required: true },
  deliveryAddress: { type: String, required: true },
  packageType:     { type: String, required: true },
  status: {
    type: String,
    enum: ['Order Placed', 'Packaging', 'In Transit', 'Reached Depot', 'Out for Delivery', 'Delivered'],
    default: 'Order Placed',
  },
  statusHistory:  { type: [statusHistorySchema], default: [] },
  otp:            { type: String, required: true },
  otpVerified:    { type: Boolean, default: false },
  assignedAgent:  { type: String, default: '' },
  paymentMethod:  { type: String, enum: ['COD', 'Online'], default: 'COD' },
  paymentStatus:  { type: String, enum: ['Pending', 'Paid'], default: 'Pending' },
  createdBy:      { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.model('Courier', courierSchema);
