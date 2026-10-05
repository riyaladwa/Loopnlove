import { Product } from '../models/Product.js';
import { Order } from '../models/Order.js';

// @desc    Fetch all products with filtering, search & sorting
// @route   GET /api/products
// @access  Public (Storefront & Admin)
export const getProducts = async (req, res, next) => {
  try {
    const { category, search, sort, featured, newArrivals, status, all, adminView } = req.query;

    const query = {};

    // For public storefront: only show published products (or products without status set)
    if (all !== 'true' && adminView !== 'true') {
      query.$or = [
        { publicationStatus: 'published' },
        { publicationStatus: { $exists: false } }
      ];
    } else if (status && status !== 'all') {
      query.publicationStatus = status;
    }

    if (category && category !== 'all') {
      query.category = new RegExp(`^${category}$`, 'i');
    }

    if (search) {
      query.$and = query.$and || [];
      query.$and.push({
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } }
        ]
      });
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
      identifier: p.identifier,
      category: p.category,
      price: p.price,
      description: p.description,
      image: p.image,
      images: p.images && p.images.length > 0 ? p.images : [p.image],
      inStock: p.inStock,
      stockQuantity: p.stockQuantity !== undefined ? p.stockQuantity : 10,
      madeToOrder: p.madeToOrder !== undefined ? p.madeToOrder : true,
      publicationStatus: p.publicationStatus || 'published',
      featured: p.featured,
      isNewArrival: p.isNewArrival,
      pdfPage: p.pdfPage,
      customizable: p.customizable,
      variations: p.variations || [],
      createdAt: p.createdAt,
      updatedAt: p.updatedAt
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
    const {
      name,
      category,
      price,
      description,
      image,
      images,
      stockQuantity,
      inStock,
      featured,
      isNewArrival,
      customizable,
      madeToOrder,
      publicationStatus,
      variations
    } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Product name is required.' });
    }
    if (price === undefined || isNaN(Number(price)) || Number(price) < 0) {
      return res.status(400).json({ success: false, message: 'Valid positive selling price is required.' });
    }
    if (!description || !description.trim()) {
      return res.status(400).json({ success: false, message: 'Product description is required.' });
    }
    if (!image || !image.trim()) {
      return res.status(400).json({ success: false, message: 'Product image URL is required.' });
    }

    const slug = name
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    const identifier = `${slug}-${Date.now().toString().slice(-4)}`;

    const parsedStock = stockQuantity !== undefined ? Math.max(0, parseInt(stockQuantity)) : 10;
    const isMadeToOrder = madeToOrder !== undefined ? Boolean(madeToOrder) : true;
    const isAvailable = inStock !== undefined ? Boolean(inStock) : (parsedStock > 0 || isMadeToOrder);

    const product = await Product.create({
      name: name.trim(),
      identifier,
      category: category || 'Crochet Flowers & Bouquets',
      price: Number(price),
      description: description.trim(),
      image: image.trim(),
      images: Array.isArray(images) && images.length > 0 ? images : [image.trim()],
      stockQuantity: parsedStock,
      inStock: isAvailable,
      featured: Boolean(featured),
      isNewArrival: isNewArrival !== undefined ? Boolean(isNewArrival) : true,
      customizable: customizable !== undefined ? Boolean(customizable) : true,
      madeToOrder: isMadeToOrder,
      publicationStatus: publicationStatus || 'published',
      variations: Array.isArray(variations) ? variations : []
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
// @route   PUT /api/products/:id or PATCH /api/products/:id
// @access  Private/Admin
export const updateProduct = async (req, res, next) => {
  try {
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(req.params.id);
    const filter = isObjectId ? { _id: req.params.id } : { identifier: req.params.id };

    const updates = { ...req.body };

    // Prevent negative stock
    if (updates.stockQuantity !== undefined) {
      updates.stockQuantity = Math.max(0, parseInt(updates.stockQuantity) || 0);
      if (updates.inStock === undefined) {
        updates.inStock = updates.stockQuantity > 0 || (updates.madeToOrder !== false);
      }
    }

    if (updates.price !== undefined) {
      updates.price = Math.max(0, Number(updates.price) || 0);
    }

    const product = await Product.findOneAndUpdate(filter, updates, {
      new: true,
      runValidators: true
    });

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
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

// @desc    Update product stock
// @route   PATCH /api/products/:id/stock
// @access  Private/Admin
export const updateProductStock = async (req, res, next) => {
  try {
    const { stockQuantity, inStock } = req.body;
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(req.params.id);
    const filter = isObjectId ? { _id: req.params.id } : { identifier: req.params.id };

    const parsedStock = Math.max(0, parseInt(stockQuantity) || 0);
    const updates = {
      stockQuantity: parsedStock,
      inStock: inStock !== undefined ? Boolean(inStock) : (parsedStock > 0)
    };

    const product = await Product.findOneAndUpdate(filter, { $set: updates }, { new: true });
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.json({
      success: true,
      message: `Stock updated for ${product.name} (${parsedStock} in stock)`,
      product
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update product publication status (draft, published, unpublished, archived)
// @route   PATCH /api/products/:id/status
// @access  Private/Admin
export const updateProductStatus = async (req, res, next) => {
  try {
    const { status, publicationStatus } = req.body;
    const targetStatus = status || publicationStatus;
    const validStatuses = ['draft', 'published', 'unpublished', 'archived'];

    if (!targetStatus || !validStatuses.includes(targetStatus)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      });
    }

    const isObjectId = /^[0-9a-fA-F]{24}$/.test(req.params.id);
    const filter = isObjectId ? { _id: req.params.id } : { identifier: req.params.id };

    const product = await Product.findOneAndUpdate(
      filter,
      { $set: { publicationStatus: targetStatus } },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.json({
      success: true,
      message: `Product status updated to ${targetStatus}`,
      product
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete or safely archive product
// @route   DELETE /api/products/:id
// @access  Private/Admin
export const deleteProduct = async (req, res, next) => {
  try {
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(req.params.id);
    const filter = isObjectId ? { _id: req.params.id } : { identifier: req.params.id };

    const product = await Product.findOne(filter);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Check if this product has historical orders
    const hasOrders = await Order.exists({ 'items.product': product._id });

    if (hasOrders && req.query.force !== 'true') {
      // Safely archive instead of hard delete to preserve historical customer orders
      product.publicationStatus = 'archived';
      await product.save();
      return res.json({
        success: true,
        archived: true,
        message: `"${product.name}" has historical orders. It has been safely archived rather than deleted to protect customer purchase records.`
      });
    }

    await Product.findByIdAndDelete(product._id);
    res.json({
      success: true,
      deleted: true,
      message: `Product "${product.name}" deleted successfully.`
    });
  } catch (err) {
    next(err);
  }
};

