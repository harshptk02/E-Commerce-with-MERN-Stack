const express = require('express');
const { body, validationResult } = require('express-validator');
const { auth } = require('../middleware/auth');

const router = express.Router();

// In-memory wishlist storage (in production, use Redis or database)
let wishlists = new Map();

// @route   GET /api/wishlist
// @desc    Get user wishlist
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const userWishlist = wishlists.get(req.user.id) || [];
    res.json(userWishlist);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/wishlist/add
// @desc    Add item to wishlist
// @access  Private
router.post('/add', [auth, [
  body('productId', 'Product ID is required').not().isEmpty()
]], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { productId } = req.body;
    const userId = req.user.id;
    
    let userWishlist = wishlists.get(userId) || [];
    
    // Check if product already exists in wishlist
    if (!userWishlist.includes(productId)) {
      userWishlist.push(productId);
      wishlists.set(userId, userWishlist);
    }
    
    res.json(userWishlist);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/wishlist/remove/:productId
// @desc    Remove item from wishlist
// @access  Private
router.delete('/remove/:productId', auth, async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user.id;
    
    let userWishlist = wishlists.get(userId) || [];
    userWishlist = userWishlist.filter(id => id !== productId);
    
    wishlists.set(userId, userWishlist);
    res.json(userWishlist);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/wishlist/clear
// @desc    Clear user wishlist
// @access  Private
router.delete('/clear', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    wishlists.delete(userId);
    res.json({ message: 'Wishlist cleared' });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 