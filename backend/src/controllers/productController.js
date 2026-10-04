import { Product } from '../models/Product.js';

// @desc    Fetch all products with filtering, search & sorting
// @route   GET /api/products
// @access  Public
export const getProducts = async (req, res, next) => {
  try {
    const { category, search, sort, featured, newArrivals } = req.query;

    const query = {};

    if (category && category !== 'all') {
      query.category = new RegExp(`^${category}$`, 'i');
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    if (featured === 'true') {
      query.featured = true;
    }

    if (newArrivals === 'true') {
      query.isNewArrival = true;
    }

    let sortOption = { createdAt: -1 }; // Default newest first

    if (sort === 'price-asc') {
      sortOption = { price: 1 };
    } else if (sort === 'price-desc') {
      sortOption = { price: -1 };
    } else if (sort === 'newest') {
      sortOption = { isNewArrival: -1, createdAt: -1 };
    }

    const products = await Product.find(query).sort(sortOption);

    // Normalize id field for frontend convenience
    const formatted = products.map(p => ({
      id: p.identifier || p._id.toString(),
      _id: p._id,
      name: p.name,
      category: p.category,
      price: p.price,
      description: p.description,
      image: p.image,
      images: p.images && p.images.length > 0 ? p.images : [p.image],
      inStock: p.inStock,
      stockQuantity: p.stockQuantity,
      featured: p.featured,
      isNewArrival: p.isNewArrival,
      pdfPage: p.pdfPage,
      customizable: p.customizable
    }));

    res.json({
      success: true,
      count: formatted.length,
      products: formatted
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Fetch single product by ID or identifier
// @route   GET /api/products/:id
// @access  Public
export const getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;
    let product = null;

    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      product = await Product.findById(id);
    }
    if (!product) {
      product = await Product.findOne({ identifier: id });
    }

    if (!product) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    res.json({
      id: product.identifier || product._id.toString(),
      _id: product._id,
      name: product.name,
      category: product.category,
      price: product.price,
      description: product.description,
      image: product.image,
      images: product.images && product.images.length > 0 ? product.images : [product.image],
      inStock: product.inStock,
      stockQuantity: product.stockQuantity,
      featured: product.featured,
      isNewArrival: product.isNewArrival,
      pdfPage: product.pdfPage,
      customizable: product.customizable
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get category counts
// @route   GET /api/categories
// @access  Public
export const getCategories = async (req, res, next) => {
  try {
    const allCategories = [
      'Crochet Flowers & Bouquets',
      'Hair Accessories',
      'Custom Keychains',
      'Crochet Bags',
      'Keychains'
    ];

    const counts = await Product.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

    const countMap = {};
    counts.forEach(c => {
      countMap[c._id] = c.count;
    });

    const result = allCategories.map(cat => ({
      name: cat,
      count: countMap[cat] || 0,
      available: (countMap[cat] || 0) > 0
    }));

    res.json(result);
  } catch (err) {
    next(err);
  }
};

// @desc    Create a new product
// @route   POST /api/products
// @access  Private/Admin
export const createProduct = async (req, res, next) => {
  try {
    const { name, category, price, description, image, images, stockQuantity, featured, isNewArrival, customizable } = req.body;

    const identifier = `bouquet-${Date.now().toString().slice(-4)}`;

    const product = await Product.create({
      name,
      identifier,
      category,
      price: Number(price),
      description,
      image,
      images: images || [image],
      stockQuantity: stockQuantity ? Number(stockQuantity) : 10,
      inStock: (stockQuantity ? Number(stockQuantity) : 10) > 0,
      featured: Boolean(featured),
      isNewArrival: Boolean(isNewArrival),
      customizable: customizable !== undefined ? Boolean(customizable) : true
    });

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      product
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private/Admin
export const updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json({
      success: true,
      message: 'Product updated successfully',
      product
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private/Admin
export const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (err) {
    next(err);
  }
};
