import { Product } from '../models/Product.js';
import { InventoryLog } from '../models/InventoryLog.js';
import { USER_ROLES } from '../constants/enums.js';

const ensureVendorRole = (user) => {
  if (![USER_ROLES.VENDOR, USER_ROLES.ADMIN].includes(user.role)) {
    const err = new Error('Only vendors or admins can manage products');
    err.statusCode = 403;
    throw err;
  }
};

const logInventoryChange = async ({
  productId,
  vendorId,
  change,
  reason,
  referenceId,
  notes
}) => {
  await InventoryLog.create({
    product: productId,
    vendor: vendorId,
    change,
    reason,
    referenceId,
    notes
  });
};

export const createProduct = async (req, res) => {
  try {
    ensureVendorRole(req.user);
    const product = await Product.create({
      ...req.body,
      vendor: req.user.role === USER_ROLES.ADMIN && req.body.vendor
        ? req.body.vendor
        : req.user._id
    });
    if (product.stockQuantity) {
      await logInventoryChange({
        productId: product._id,
        vendorId: product.vendor,
        change: product.stockQuantity,
        reason: 'restock',
        notes: 'Initial stock'
      });
    }
    return res.status(201).json({
      status: 'success',
      data: { product }
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      status: 'error',
      message: error.message
    });
  }
};

export const listProducts = async (req, res) => {
  try {
    const { category, vendor, search, isActive = true } = req.query;
    const filter = {};
    if (category) filter.category = category;
    if (vendor) filter.vendor = vendor;
    if (req.query.isActive !== undefined) {
      filter.isActive = req.query.isActive === 'true';
    }
    if (search) {
      filter.$text = { $search: search };
    }

    const products = await Product.find(filter)
      .populate('vendor', 'name email phone')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      status: 'success',
      data: { products }
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

export const getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate(
      'vendor',
      'name email phone'
    );
    if (!product) {
      return res.status(404).json({
        status: 'error',
        message: 'Product not found'
      });
    }
    return res.status(200).json({
      status: 'success',
      data: { product }
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

export const updateProduct = async (req, res) => {
  try {
    ensureVendorRole(req.user);
    const filter = { _id: req.params.id };
    if (req.user.role === USER_ROLES.VENDOR) {
      filter.vendor = req.user._id;
    }

    const prevProduct = await Product.findOne(filter);
    if (!prevProduct) {
      return res.status(404).json({
        status: 'error',
        message: 'Product not found or not authorized'
      });
    }

    const updated = await Product.findByIdAndUpdate(prevProduct._id, req.body, {
      new: true,
      runValidators: true
    });

    if (
      req.body.stockQuantity !== undefined &&
      req.body.stockQuantity !== prevProduct.stockQuantity
    ) {
      await logInventoryChange({
        productId: updated._id,
        vendorId: updated.vendor,
        change: req.body.stockQuantity - prevProduct.stockQuantity,
        reason: 'adjustment',
        notes: 'Manual stock update'
      });
    }

    return res.status(200).json({
      status: 'success',
      data: { product: updated }
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      status: 'error',
      message: error.message
    });
  }
};

export const toggleProductStatus = async (req, res) => {
  try {
    ensureVendorRole(req.user);
    const filter = { _id: req.params.id };
    if (req.user.role === USER_ROLES.VENDOR) {
      filter.vendor = req.user._id;
    }
    const product = await Product.findOne(filter);
    if (!product) {
      return res.status(404).json({
        status: 'error',
        message: 'Product not found or not authorized'
      });
    }
    product.isActive = !product.isActive;
    await product.save();
    return res.status(200).json({
      status: 'success',
      data: { product }
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      status: 'error',
      message: error.message
    });
  }
};

