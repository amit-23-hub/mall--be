const Rule = require('../models/Rule');

// @desc    Get all rules
// @route   GET /api/rules
// @access  Private
exports.getRules = async (req, res, next) => {
  try {
    let query;
    
    // Copy req.query
    const reqQuery = { ...req.query };
    
    // Fields to exclude
    const removeFields = ['select', 'sort', 'page', 'limit'];
    
    // Loop over removeFields and delete them from reqQuery
    removeFields.forEach(param => delete reqQuery[param]);
    
    // Create query string
    let queryStr = JSON.stringify(reqQuery);
    
    // Create operators ($gt, $gte, etc)
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);
    
    // Finding resource
    query = Rule.find(JSON.parse(queryStr));
    
    // Select Fields
    if (req.query.select) {
      const fields = req.query.select.split(',').join(' ');
      query = query.select(fields);
    }
    
    // Sort
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('-createdAt');
    }
    
    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 25;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await Rule.countDocuments();
    
    query = query.skip(startIndex).limit(limit);
    
    // Executing query
    const rules = await query;
    
    // Pagination result
    const pagination = {};
    
    if (endIndex < total) {
      pagination.next = {
        page: page + 1,
        limit
      };
    }
    
    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit
      };
    }
    
    res.status(200).json({
      success: true,
      count: rules.length,
      pagination,
      data: rules
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get rules by role ID
// @route   GET /api/rules/role/:roleId
// @access  Private
exports.getRulesByRole = async (req, res, next) => {
  try {
    const rules = await Rule.find({ roleId: req.params.roleId });
    
    res.status(200).json({
      success: true,
      count: rules.length,
      data: rules
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single rule
// @route   GET /api/rules/:id
// @access  Private
exports.getRule = async (req, res, next) => {
  try {
    const rule = await Rule.findById(req.params.id);
    
    if (!rule) {
      return res.status(404).json({ success: false, message: 'Rule not found' });
    }
    
    res.status(200).json({ success: true, data: rule });
  } catch (err) {
    next(err);
  }
};

// @desc    Create rule
// @route   POST /api/rules
// @access  Private/Admin
exports.createRule = async (req, res, next) => {
  try {
    const rule = await Rule.create(req.body);
    res.status(201).json({ success: true, data: rule });
  } catch (err) {
    next(err);
  }
};

// @desc    Update rule
// @route   PUT /api/rules/:id
// @access  Private/Admin
exports.updateRule = async (req, res, next) => {
  try {
    const rule = await Rule.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    
    if (!rule) {
      return res.status(404).json({ success: false, message: 'Rule not found' });
    }
    
    res.status(200).json({ success: true, data: rule });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete rule
// @route   DELETE /api/rules/:id
// @access  Private/Admin
exports.deleteRule = async (req, res, next) => {
  try {
    const rule = await Rule.findById(req.params.id);
    
    if (!rule) {
      return res.status(404).json({ success: false, message: 'Rule not found' });
    }
    
    await rule.deleteOne();
    
    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    next(err);
  }
};
