const express = require('express');
const { auth, admin } = require('../middleware/auth');
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');

const router = express.Router();

// @route   GET /api/admin/dashboard
// @desc    Get admin dashboard stats
// @access  Admin
router.get('/dashboard', [auth, admin], async (req, res) => {
  try {
    const [totalUsers, totalProducts, totalOrders, orders, products] = await Promise.all([
      User.countDocuments(),
      Product.countDocuments(),
      Order.countDocuments(),
      Order.find().sort({ createdAt: -1 }).limit(5).populate('user', 'name email').populate('items.product', 'name images price'),
      Product.find({ stock: { $lt: 5 }, isActive: true }).limit(5)
    ]);
    const totalRevenueAgg = await Order.aggregate([
      { $group: { _id: null, total: { $sum: '$total' } } }
    ]);
    const totalRevenue = totalRevenueAgg[0]?.total || 0;
    res.json({
      totalUsers,
      totalProducts,
      totalOrders,
      totalRevenue,
      recentOrders: orders,
      lowStockProducts: products
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/stats/overview
// @desc    Get revenue and order counts per month for the last 12 months
// @access  Admin
router.get('/stats/overview', [auth, admin], async (req, res) => {
  try {
    const now = new Date();
    const months = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        year: d.getFullYear(),
        month: d.getMonth() + 1 // 1-based
      });
    }
    // Aggregate orders by month
    const ordersAgg = await Order.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(now.getFullYear(), now.getMonth() - 11, 1),
            $lte: now
          }
        }
      },
      {
        $group: {
          _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          totalRevenue: { $sum: '$total' },
          orderCount: { $sum: 1 }
        }
      }
    ]);
    // Map to months array
    const stats = months.map(({ year, month }) => {
      const found = ordersAgg.find(o => o._id.year === year && o._id.month === month);
      return {
        year,
        month,
        totalRevenue: found ? found.totalRevenue : 0,
        orderCount: found ? found.orderCount : 0
      };
    });
    res.json({ stats });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 