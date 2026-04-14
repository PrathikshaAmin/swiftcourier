const express = require('express');
const Courier = require('../models/Courier');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

const STATUSES = ['Order Placed', 'Packaging', 'In Transit', 'Reached Depot', 'Out for Delivery', 'Delivered'];

const genTrackingId = () => 'TRK' + Math.floor(100000000 + Math.random() * 900000000);
const genOTP = () => {
  const len = Math.floor(Math.random() * 3) + 4;
  return String(Math.floor(Math.pow(10, len - 1) + Math.random() * 9 * Math.pow(10, len - 1)));
};

// ── POST /api/courier/create ─────────────────────────────────────────────────
router.post('/create', protect, async (req, res) => {
  try {
    const { senderName, receiverName, pickupAddress, deliveryAddress, packageType, paymentMethod } = req.body;
    if (!senderName || !receiverName || !pickupAddress || !deliveryAddress || !packageType)
      return res.status(400).json({ message: 'All fields are required' });

    let trackingId, exists = true;
    while (exists) {
      trackingId = genTrackingId();
      exists = await Courier.findOne({ trackingId });
    }

    const otp = genOTP();
    const method = paymentMethod === 'Online' ? 'Online' : 'COD';
    const paymentStatus = method === 'Online' ? 'Paid' : 'Pending';

    const courier = await Courier.create({
      trackingId, senderName, receiverName,
      pickupAddress, deliveryAddress, packageType,
      otp,
      status: 'Order Placed',
      statusHistory: [{ status: 'Order Placed', timestamp: new Date() }],
      paymentMethod: method,
      paymentStatus,
      createdBy: req.user.id,
    });

    res.status(201).json({ ...courier.toObject(), otp });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── GET /api/courier/all — admin, sorted latest first ────────────────────────
router.get('/all', protect, adminOnly, async (req, res) => {
  try {
    const couriers = await Courier.find()
      .sort({ createdAt: -1 })
      .populate('createdBy', 'name email');
    res.json(couriers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── GET /api/courier/my — customer ───────────────────────────────────────────
router.get('/my', protect, async (req, res) => {
  try {
    const couriers = await Courier.find({ createdBy: req.user.id }).sort({ createdAt: -1 });
    res.json(couriers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── GET /api/courier/stats — admin ───────────────────────────────────────────
router.get('/stats', protect, adminOnly, async (req, res) => {
  try {
    const counts = await Promise.all(
      ['Order Placed', 'Packaging', 'In Transit', 'Reached Depot', 'Out for Delivery', 'Delivered'].map(s =>
        Courier.countDocuments({ status: s })
      )
    );
    const total = await Courier.countDocuments();
    res.json({
      total,
      orderPlaced:     counts[0],
      packaging:       counts[1],
      inTransit:       counts[2],
      reachedDepot:    counts[3],
      outForDelivery:  counts[4],
      delivered:       counts[5],
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── GET /api/courier/track/:trackingId — PUBLIC ──────────────────────────────
router.get('/track/:trackingId', async (req, res) => {
  try {
    const courier = await Courier.findOne({
      trackingId: req.params.trackingId.toUpperCase(),
    }).select('-otp');
    if (!courier) return res.status(404).json({ message: 'Tracking ID not found. Please check and try again.' });
    res.json(courier);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── GET /api/courier/track-auth/:trackingId — authenticated (includes OTP for owner) ──
router.get('/track-auth/:trackingId', protect, async (req, res) => {
  try {
    const courier = await Courier.findOne({
      trackingId: req.params.trackingId.toUpperCase(),
    });
    if (!courier) return res.status(404).json({ message: 'Tracking ID not found.' });
    // Only expose OTP to the owner or admin
    const isOwner = String(courier.createdBy) === String(req.user.id);
    const isAdmin = req.user.role === 'admin';
    if (!isOwner && !isAdmin) return res.status(403).json({ message: 'Access denied' });
    res.json(courier);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── PUT /api/courier/update/:id — admin (status + agent) ─────────────────────
router.put('/update/:id', protect, adminOnly, async (req, res) => {
  try {
    const { status, assignedAgent } = req.body;
    const courier = await Courier.findById(req.params.id);
    if (!courier) return res.status(404).json({ message: 'Courier not found' });

    if (status && status !== courier.status) {
      courier.status = status;
      courier.statusHistory.push({ status, timestamp: new Date() });
    }
    if (assignedAgent !== undefined) courier.assignedAgent = assignedAgent;
    await courier.save();
    res.json(courier);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── PUT /api/courier/assign-agent/:id — admin ────────────────────────────────
router.put('/assign-agent/:id', protect, adminOnly, async (req, res) => {
  try {
    const { assignedAgent } = req.body;
    if (!assignedAgent?.trim()) return res.status(400).json({ message: 'Agent name required' });
    const courier = await Courier.findByIdAndUpdate(
      req.params.id,
      { assignedAgent: assignedAgent.trim() },
      { new: true }
    );
    if (!courier) return res.status(404).json({ message: 'Courier not found' });
    res.json(courier);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── PUT /api/courier/update-status/:id — admin ───────────────────────────────
router.put('/update-status/:id', protect, adminOnly, async (req, res) => {
  try {
    const { status } = req.body;
    if (!status) return res.status(400).json({ message: 'Status required' });
    const courier = await Courier.findById(req.params.id);
    if (!courier) return res.status(404).json({ message: 'Courier not found' });
    courier.status = status;
    courier.statusHistory.push({ status, timestamp: new Date() });
    await courier.save();
    res.json(courier);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── POST /api/courier/verify-otp ─────────────────────────────────────────────
router.post('/verify-otp', protect, async (req, res) => {
  try {
    const { courierId, otp } = req.body;
    const courier = await Courier.findById(courierId);
    if (!courier) return res.status(404).json({ message: 'Courier not found' });
    if (courier.status !== 'Out for Delivery')
      return res.status(400).json({ message: 'Courier is not out for delivery yet' });
    if (courier.otp !== String(otp))
      return res.status(400).json({ message: 'Incorrect OTP. Please try again.' });

    courier.status = 'Delivered';
    courier.otpVerified = true;
    courier.statusHistory.push({ status: 'Delivered', timestamp: new Date() });
    await courier.save();
    res.json({ message: 'Delivery confirmed successfully!', courier });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
