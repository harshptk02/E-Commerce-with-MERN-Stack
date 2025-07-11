const express = require('express');
const { body, validationResult } = require('express-validator');
const Category = require('../models/Category');
const { auth, admin } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/categories
// @desc    Get all categories (public)
// @access  Public
router.get('/', async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true }).populate('parent', 'name');
    res.json(categories);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/categories
// @desc    Create a category
// @access  Admin
router.post('/', [auth, admin, [
  body('name', 'Name is required').not().isEmpty()
]], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const category = new Category(req.body);
    await category.save();
    
    const populatedCategory = await Category.findById(category._id).populate('parent', 'name');
    res.json(populatedCategory);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/categories/:id
// @desc    Update a category
// @access  Admin
router.put('/:id', [auth, admin], async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('parent', 'name');

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    res.json(category);
  } catch (error) {
    console.error(error.message);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Category not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/categories/:id
// @desc    Delete a category
// @access  Admin
router.delete('/:id', [auth, admin], async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    res.json({ message: 'Category removed' });
  } catch (error) {
    console.error(error.message);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Category not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 