const express = require('express');
const Order = require('../models/Order');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

// POST /api/orders — create new order (public or authenticated)
router.post('/', async (req, res) => {
  try {
    const { customerName, phone, pickupAddress, deliveryAddress, parcelType, weight, description } = req.body;
    if (!customerName || !phone || !pickupAddress || !deliveryAddress || !parcelType || !weight)
      return res.status(400).json({ message: 'All required fields must be filled' });

    const order = await Order.create({
      customerName, phone, pickupAddress, deliveryAddress,
      parcelType, weight: Number(weight), description: description || '',
    });

    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/orders — fetch all orders (admin)
router.get('/', protect, adminOnly, async (req, res) => {
  try {
    const { search } = req.query;
    const query = search
      ? {
          $or: [
            { orderId: { $regex: search, $options: 'i' } },
            { phone: { $regex: search, $options: 'i' } },
            { customerName: { $regex: search, $options: 'i' } },
          ],
        }
      : {};
    const orders = await Order.find(query).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/orders/:id — fetch single order
router.get('/:id', protect, adminOnly, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/orders/:id — update order status
router.patch('/:id', protect, adminOnly, async (req, res) => {
  try {
    const { status } = req.body;
    const VALID = ['Pending', 'Shipped', 'Out for Delivery', 'Delivered'];
    if (!VALID.includes(status))
      return res.status(400).json({ message: 'Invalid status value' });

    const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
