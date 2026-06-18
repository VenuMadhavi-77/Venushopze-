const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const { protect, authorize } = require('../middlewares/auth');

// @route   GET /api/analytics/seller
// @desc    Get seller stats and product sales details
router.get('/seller', protect, authorize('seller', 'admin'), async (req, res) => {
  try {
    const sellerId = req.user._id;

    // 1. Get products count
    const totalProducts = await Product.countDocuments({ seller: sellerId });

    // 2. Get orders containing seller's products
    const orders = await Order.find({ 'items.seller': sellerId });

    let totalEarnings = 0;
    let itemsSold = 0;
    let pendingOrders = 0;
    const productSalesMap = {};

    orders.forEach(order => {
      // Find items in this order belonging to this seller
      const sellerItems = order.items.filter(item => item.seller.toString() === sellerId.toString());
      
      sellerItems.forEach(item => {
        const itemRevenue = item.price * item.quantity;
        totalEarnings += itemRevenue;
        itemsSold += item.quantity;

        // Populate sales map for graph representation
        if (productSalesMap[item.name]) {
          productSalesMap[item.name].quantity += item.quantity;
          productSalesMap[item.name].revenue += itemRevenue;
        } else {
          productSalesMap[item.name] = {
            quantity: item.quantity,
            revenue: itemRevenue
          };
        }
      });

      if (['Processing', 'Shipped'].includes(order.orderStatus)) {
        pendingOrders += 1;
      }
    });

    const salesBreakdown = Object.keys(productSalesMap).map(name => ({
      name,
      quantity: productSalesMap[name].quantity,
      revenue: productSalesMap[name].revenue
    }));

    res.json({
      summary: {
        totalProducts,
        totalEarnings,
        itemsSold,
        pendingOrders
      },
      salesBreakdown
    });
  } catch (error) {
    console.error('Fetch seller analytics error:', error);
    res.status(500).json({ message: 'Server error fetching seller analytics' });
  }
});

// @route   GET /api/analytics/admin
// @desc    Get admin stats & overview dashboard metrics
router.get('/admin', protect, authorize('admin'), async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({});
    const totalProducts = await Product.countDocuments({});
    const totalOrders = await Order.countDocuments({});

    // Calculate total system revenue
    const orders = await Order.find({ orderStatus: { $ne: 'Cancelled' } });
    const totalRevenue = orders.reduce((acc, order) => acc + order.totalAmount, 0);

    // Get order status breakdown
    const statusBreakdown = {
      Processing: await Order.countDocuments({ orderStatus: 'Processing' }),
      Shipped: await Order.countDocuments({ orderStatus: 'Shipped' }),
      Delivered: await Order.countDocuments({ orderStatus: 'Delivered' }),
      Cancelled: await Order.countDocuments({ orderStatus: 'Cancelled' })
    };

    res.json({
      summary: {
        totalUsers,
        totalProducts,
        totalOrders,
        totalRevenue
      },
      statusBreakdown
    });
  } catch (error) {
    console.error('Fetch admin analytics error:', error);
    res.status(500).json({ message: 'Server error fetching admin analytics' });
  }
});

// @route   GET /api/analytics/admin/users
// @desc    List all users (Admin only)
router.get('/admin/users', protect, authorize('admin'), async (req, res) => {
  try {
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    console.error('Fetch users error:', error);
    res.status(500).json({ message: 'Server error fetching users' });
  }
});

// @route   PUT /api/analytics/admin/users/:id/role
// @desc    Update user role (Admin only)
router.put('/admin/users/:id/role', protect, authorize('admin'), async (req, res) => {
  try {
    const { role } = req.body;
    if (!['user', 'seller', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role type' });
    }

    // Prevent admin from changing their own role (self-demotion safety)
    if (req.user._id.toString() === req.params.id) {
      return res.status(400).json({ message: 'Cannot demote yourself' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.role = role;
    await user.save();

    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    });
  } catch (error) {
    console.error('Update role error:', error);
    res.status(500).json({ message: 'Server error updating user role' });
  }
});

// @route   DELETE /api/analytics/admin/users/:id
// @desc    Delete user (Admin only)
router.delete('/admin/users/:id', protect, authorize('admin'), async (req, res) => {
  try {
    if (req.user._id.toString() === req.params.id) {
      return res.status(400).json({ message: 'Cannot delete yourself' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User account deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Server error deleting user' });
  }
});

module.exports = router;
