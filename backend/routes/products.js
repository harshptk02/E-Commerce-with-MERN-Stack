const express = require('express');
const { body, validationResult } = require('express-validator');
const Product = require('../models/Product');
const { auth, admin } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/products
// @desc    Get all products (public)
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, category, brand, search, sort = 'createdAt', order = 'desc' } = req.query;
    
    const query = { isActive: true };
    
    if (category) query.category = category;
    if (brand) query.brand = brand;
    if (search) {
      query.$text = { $search: search };
    }

    const sortOptions = {};
    sortOptions[sort] = order === 'desc' ? -1 : 1;

    const products = await Product.find(query)
      .populate('category', 'name')
      .populate('brand', 'name')
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await Product.countDocuments(query);

    res.json({
      products,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/products/:id
// @desc    Get product by ID (public)
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('category', 'name')
      .populate('brand', 'name');

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    console.error(error.message);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/products
// @desc    Create a product
// @access  Admin
router.post('/', [auth, admin, [
  body('name', 'Name is required').not().isEmpty(),
  body('description', 'Description is required').not().isEmpty(),
  body('price', 'Price must be a positive number').isFloat({ min: 0 }),
  body('category', 'Category is required').not().isEmpty(),
  body('brand', 'Brand is required').not().isEmpty(),
  body('sku', 'SKU is required').not().isEmpty()
]], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    // Ensure images is an array of valid URLs or /uploads paths
    let images = req.body.images;
    if (!Array.isArray(images)) images = [];
    images = images.filter(url => typeof url === 'string' && (
      url.startsWith('http://') || url.startsWith('https://') || url.startsWith('/uploads/')
    ));
    if (images.length === 0) {
      images = ['https://placehold.net/400x400.png'];
    }
    req.body.images = images;

    const product = new Product(req.body);
    await product.save();
    
    const populatedProduct = await Product.findById(product._id)
      .populate('category', 'name')
      .populate('brand', 'name');

    res.json(populatedProduct);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/products/:id
// @desc    Update a product
// @access  Admin
router.put('/:id', [auth, admin], async (req, res) => {
  try {
    // Ensure images is an array of valid URLs or /uploads paths
    let images = req.body.images;
    if (!Array.isArray(images)) images = [];
    images = images.filter(url => typeof url === 'string' && (
      url.startsWith('http://') || url.startsWith('https://') || url.startsWith('/uploads/')
    ));
    if (images.length === 0) {
      images = ['https://placehold.net/400x400.png'];
    }
    req.body.images = images;

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('category', 'name').populate('brand', 'name');

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    console.error(error.message);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/products/:id
// @desc    Delete a product
// @access  Admin
router.delete('/:id', [auth, admin], async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json({ message: 'Product removed' });
  } catch (error) {
    console.error(error.message);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 