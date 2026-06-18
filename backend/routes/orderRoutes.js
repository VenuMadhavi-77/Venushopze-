const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const Cart = require('../models/Cart');
const { protect, authorize } = require('../middlewares/auth');

// @route   POST /api/orders
// @desc    Create a new order (Checkout)
router.post('/', protect, async (req, res) => {
  try {
    const { items, shippingAddress, paymentMethod, paymentStatus } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'No order items' });
    }

    if (!shippingAddress || !shippingAddress.street || !shippingAddress.city || !shippingAddress.state || !shippingAddress.postalCode) {
      return res.status(400).json({ message: 'Please provide complete shipping address' });
    }

    // Verify stock and fetch fresh product data to calculate total
    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.product._id || item.product);
      if (!product) {
        return res.status(404).json({ message: `Product ${item.name} not found` });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({ message: `Insufficient stock for product ${product.name}. Available: ${product.stock}` });
      }

      // Decrement stock
      product.stock -= item.quantity;
      await product.save();

      const itemTotal = product.price * item.quantity;
      totalAmount += itemTotal;

      orderItems.push({
        product: product._id,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
        image: product.images[0],
        seller: product.seller
      });
    }

    // Create the order
    const order = await Order.create({
      user: req.user._id,
      items: orderItems,
      shippingAddress,
      paymentMethod: paymentMethod || 'COD',
      paymentStatus: paymentStatus || (paymentMethod === 'Card' ? 'Paid' : 'Pending'),
      totalAmount
    });

    // Clear user's cart
    await Cart.findOneAndUpdate({ user: req.user._id }, { items: [] });

    res.status(201).json(order);
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ message: 'Server error creating order' });
  }
});

// @route   GET /api/orders/my-orders
// @desc    Get logged in user orders
router.get('/my-orders', protect, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    console.error('Fetch my orders error:', error);
    res.status(500).json({ message: 'Server error fetching user orders' });
  }
});

// @route   GET /api/orders/seller
// @desc    Get orders containing products owned by the seller
router.get('/seller', protect, authorize('seller', 'admin'), async (req, res) => {
  try {
    // If admin, they can see all orders, but let's filter for sellers
    let query = {};
    if (req.user.role === 'seller') {
      query = { 'items.seller': req.user._id };
    }

    const orders = await Order.find(query).populate('user', 'name email').sort({ createdAt: -1 });
    
    // If user is a seller, filter the items to show only their products for privacy, 
    // or send full orders with flag. Let's filter items if role is seller.
    if (req.user.role === 'seller') {
      const sellerOrders = orders.map(order => {
        const orderObj = order.toObject();
        orderObj.items = orderObj.items.filter(item => item.seller.toString() === req.user._id.toString());
        // Re-calculate seller total for this order
        orderObj.sellerTotal = orderObj.items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
        return orderObj;
      });
      return res.json(sellerOrders);
    }

    res.json(orders);
  } catch (error) {
    console.error('Fetch seller orders error:', error);
    res.status(500).json({ message: 'Server error fetching seller orders' });
  }
});

// @route   GET /api/orders/admin
// @desc    Get all orders (Admins only)
router.get('/admin', protect, authorize('admin'), async (req, res) => {
  try {
    const orders = await Order.find({}).populate('user', 'name email').sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    console.error('Fetch admin orders error:', error);
    res.status(500).json({ message: 'Server error fetching admin orders' });
  }
});

// @route   PUT /api/orders/:id/status
// @desc    Update order status (Seller or Admin)
router.put('/:id/status', protect, authorize('seller', 'admin'), async (req, res) => {
  try {
    const { orderStatus, paymentStatus } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Verify if seller is authorized (owns at least one item in the order)
    if (req.user.role === 'seller') {
      const ownsItem = order.items.some(item => item.seller.toString() === req.user._id.toString());
      if (!ownsItem) {
        return res.status(403).json({ message: 'Not authorized to update this order' });
      }
    }

    if (orderStatus) {
      order.orderStatus = orderStatus;
    }
    if (paymentStatus) {
      order.paymentStatus = paymentStatus;
    }

    await order.save();
    res.json(order);
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ message: 'Server error updating order' });
  }
});

module.exports = router;
