const express = require('express');
const router = express.Router();
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { protect } = require('../middlewares/auth');

// Helper to get or create cart
const getOrCreateCart = async (userId) => {
  let cart = await Cart.findOne({ user: userId });
  if (!cart) {
    cart = await Cart.create({ user: userId, items: [] });
  }
  return cart;
};

// @route   GET /api/cart
// @desc    Get user's cart
router.get('/', protect, async (req, res) => {
  try {
    const cart = await getOrCreateCart(req.user._id);
    
    // Populate product details and filter out nulls (deleted products)
    const populatedCart = await Cart.findOne({ user: req.user._id }).populate({
      path: 'items.product',
      select: 'name price originalPrice images stock category'
    });

    if (populatedCart) {
      // Filter out items where product was deleted
      const originalLength = populatedCart.items.length;
      populatedCart.items = populatedCart.items.filter(item => item.product !== null);
      if (populatedCart.items.length !== originalLength) {
        await populatedCart.save();
      }
      res.json(populatedCart);
    } else {
      res.json(cart);
    }
  } catch (error) {
    console.error('Fetch cart error:', error);
    res.status(500).json({ message: 'Server error fetching cart' });
  }
});

// @route   POST /api/cart
// @desc    Add or update item quantity in cart
router.post('/', protect, async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const qty = Number(quantity) || 1;

    if (!productId) {
      return res.status(400).json({ message: 'Product ID is required' });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const cart = await getOrCreateCart(req.user._id);

    // Check if product already in cart
    const itemIndex = cart.items.findIndex(item => item.product.toString() === productId);

    if (itemIndex > -1) {
      // Product exists, update quantity
      cart.items[itemIndex].quantity = qty;
    } else {
      // Product does not exist, push new item
      cart.items.push({ product: productId, quantity: qty });
    }

    cart.updatedAt = Date.now();
    await cart.save();

    const populatedCart = await Cart.findOne({ user: req.user._id }).populate({
      path: 'items.product',
      select: 'name price originalPrice images stock category'
    });

    res.json(populatedCart);
  } catch (error) {
    console.error('Update cart item error:', error);
    res.status(500).json({ message: 'Server error updating cart' });
  }
});

// @route   POST /api/cart/sync
// @desc    Sync local storage cart items array to server
router.post('/sync', protect, async (req, res) => {
  try {
    const { items } = req.body; // Array of { product: id, quantity: number }

    if (!items || !Array.isArray(items)) {
      return res.status(400).json({ message: 'Invalid items array' });
    }

    const cart = await getOrCreateCart(req.user._id);

    // Merge logic: if item exists in sync array, use that quantity or add it
    for (const syncItem of items) {
      if (!syncItem.product) continue;
      const prodId = syncItem.product._id || syncItem.product;
      const index = cart.items.findIndex(item => item.product.toString() === prodId.toString());
      if (index > -1) {
        // Overwrite or sum? Let's take the higher quantity
        cart.items[index].quantity = Math.max(cart.items[index].quantity, syncItem.quantity);
      } else {
        // Ensure product exists
        const exists = await Product.findById(prodId);
        if (exists) {
          cart.items.push({ product: prodId, quantity: syncItem.quantity });
        }
      }
    }

    cart.updatedAt = Date.now();
    await cart.save();

    const populatedCart = await Cart.findOne({ user: req.user._id }).populate({
      path: 'items.product',
      select: 'name price originalPrice images stock category'
    });

    res.json(populatedCart);
  } catch (error) {
    console.error('Sync cart error:', error);
    res.status(500).json({ message: 'Server error syncing cart' });
  }
});

// @route   DELETE /api/cart/:productId
// @desc    Delete item from cart
router.delete('/:productId', protect, async (req, res) => {
  try {
    const { productId } = req.params;
    const cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    cart.items = cart.items.filter(item => item.product.toString() !== productId);
    cart.updatedAt = Date.now();
    await cart.save();

    const populatedCart = await Cart.findOne({ user: req.user._id }).populate({
      path: 'items.product',
      select: 'name price originalPrice images stock category'
    });

    res.json(populatedCart);
  } catch (error) {
    console.error('Delete cart item error:', error);
    res.status(500).json({ message: 'Server error removing item from cart' });
  }
});

module.exports = router;
