const express = require('express');
const { body, validationResult } = require('express-validator');
const Brand = require('../models/Brand');
const { auth, admin } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/brands
// @desc    Get all brands (public)
// @access  Public
router.get('/', async (req, res) => {
  try {
    const brands = await Brand.find({ isActive: true });
    res.json(brands);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/brands
// @desc    Create a brand
// @access  Admin
router.post('/', [auth, admin, [
  body('name', 'Name is required').not().isEmpty()
]], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const brand = new Brand(req.body);
    await brand.save();
    res.json(brand);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/brands/:id
// @desc    Update a brand
// @access  Admin
router.put('/:id', [auth, admin], async (req, res) => {
  try {
    const brand = await Brand.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!brand) {
      return res.status(404).json({ message: 'Brand not found' });
    }

    res.json(brand);
  } catch (error) {
    console.error(error.message);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Brand not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/brands/:id
// @desc    Delete a brand
// @access  Admin
router.delete('/:id', [auth, admin], async (req, res) => {
  try {
    const brand = await Brand.findByIdAndDelete(req.params.id);

    if (!brand) {
      return res.status(404).json({ message: 'Brand not found' });
    }

    res.json({ message: 'Brand removed' });
  } catch (error) {
    console.error(error.message);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Brand not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 