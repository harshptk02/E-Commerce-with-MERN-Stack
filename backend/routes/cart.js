const express = require('express');
const { body, validationResult } = require('express-validator');
const { auth } = require('../middleware/auth');
const Product = require('../models/Product');

const router = express.Router();

// In-memory cart storage (in production, use Redis or database)
let carts = new Map();

// Helper to get detailed cart
async function getDetailedCart(userCart) {
  const detailedCart = await Promise.all(userCart.map(async (item) => {
    const product = await Product.findById(item.productId);
    if (!product) return null;
    return {
      _id: product._id,
      name: product.name,
      images: product.images,
      price: product.price,
      stock: product.stock,
      quantity: item.quantity
    };
  }));
  return detailedCart.filter(Boolean);
}

// @route   GET /api/cart
// @desc    Get user cart
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const userCart = carts.get(req.user.id) || [];
    res.json(await getDetailedCart(userCart));
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/cart/add
// @desc    Add item to cart
// @access  Private
router.post('/add', [auth, [
  body('productId', 'Product ID is required').not().isEmpty(),
  body('quantity', 'Quantity must be a positive number').isInt({ min: 1 })
]], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { productId, quantity } = req.body;
    const userId = req.user.id;
    
    let userCart = carts.get(userId) || [];
    
    // Check if product already exists in cart
    const existingItemIndex = userCart.findIndex(item => item.productId === productId);
    
    if (existingItemIndex > -1) {
      // Update quantity
      userCart[existingItemIndex].quantity += quantity;
    } else {
      // Add new item
      userCart.push({ productId, quantity });
    }
    
    carts.set(userId, userCart);
    res.json(await getDetailedCart(userCart));
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/cart/update
// @desc    Update cart item quantity
// @access  Private
router.put('/update', [auth, [
  body('productId', 'Product ID is required').not().isEmpty(),
  body('quantity', 'Quantity must be a positive number').isInt({ min: 1 })
]], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { productId, quantity } = req.body;
    const userId = req.user.id;
    
    let userCart = carts.get(userId) || [];
    const itemIndex = userCart.findIndex(item => item.productId === productId);
    
    if (itemIndex > -1) {
      userCart[itemIndex].quantity = quantity;
      carts.set(userId, userCart);
      res.json(await getDetailedCart(userCart));
    } else {
      res.status(404).json({ message: 'Item not found in cart' });
    }
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/cart/remove/:productId
// @desc    Remove item from cart
// @access  Private
router.delete('/remove/:productId', auth, async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user.id;
    
    let userCart = carts.get(userId) || [];
    userCart = userCart.filter(item => item.productId !== productId);
    
    carts.set(userId, userCart);
    res.json(await getDetailedCart(userCart));
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/cart/clear
// @desc    Clear user cart
// @access  Private
router.delete('/clear', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    carts.delete(userId);
    res.json({ message: 'Cart cleared' });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 