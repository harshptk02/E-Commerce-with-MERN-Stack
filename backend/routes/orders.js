const express = require('express');
const { body, validationResult } = require('express-validator');
const Order = require('../models/Order');
const { auth, admin } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/orders
// @desc    Get orders (user gets their own, admin gets all)
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    
    const query = req.user.role === 'admin' ? {} : { user: req.user.id };
    if (status) query.status = status;

    const orders = await Order.find(query)
      .populate('user', 'name email')
      .populate('items.product', 'name images price')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await Order.countDocuments(query);

    res.json({
      orders,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/orders/:id
// @desc    Get order by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email')
      .populate('items.product', 'name images price');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if user is authorized to view this order
    if (req.user.role !== 'admin' && order.user._id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.json(order);
  } catch (error) {
    console.error(error.message);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/orders
// @desc    Create a new order
// @access  Private
router.post('/', [auth, [
  body('items', 'Items are required').isArray({ min: 1 }),
  body('shippingAddress', 'Shipping address is required').not().isEmpty(),
  body('paymentMethod', 'Payment method is required').not().isEmpty()
]], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { items, shippingAddress, paymentMethod, paymentStatus } = req.body;

    // Calculate totals
    let subtotal = 0;
    for (let item of items) {
      subtotal += item.price * item.quantity;
    }

    const tax = subtotal * 0.1; // 10% tax
    const shippingCost = subtotal > 100 ? 0 : 10; // Free shipping over $100
    const total = subtotal + tax + shippingCost;

    const order = new Order({
      user: req.user.id,
      items,
      shippingAddress,
      paymentMethod,
      paymentStatus: paymentStatus || 'pending',
      subtotal,
      tax,
      shippingCost,
      total
    });

    await order.save();

    // Decrement product stock for each item
    for (const item of items) {
      await require('../models/Product').findByIdAndUpdate(
        item.product,
        { $inc: { stock: -item.quantity } },
        { new: false }
      );
    }

    const populatedOrder = await Order.findById(order._id)
      .populate('user', 'name email')
      .populate('items.product', 'name images price');

    res.json(populatedOrder);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/orders/:id/status
// @desc    Update order status (admin only)
// @access  Admin
router.put('/:id/status', [auth, admin], async (req, res) => {
  try {
    const { status } = req.body;
    const orderDoc = await Order.findById(req.params.id);
    if (!orderDoc) {
      return res.status(404).json({ message: 'Order not found' });
    }
    let update = { status };
    if (status === 'delivered' && orderDoc.paymentMethod === 'cod') {
      update.paymentStatus = 'paid';
    }
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      update,
      { new: true, runValidators: true }
    ).populate('user', 'name email').populate('items.product', 'name images price');
    res.json(order);
  } catch (error) {
    console.error(error.message);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 