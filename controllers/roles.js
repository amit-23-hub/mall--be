const Role = require('../models/Role');

// @desc    Get all roles
// @route   GET /api/roles
// @access  Private
exports.getRoles = async (req, res, next) => {
  try {
    const roles = await Role.find();
    res.status(200).json({ success: true, count: roles.length, data: roles });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single role
// @route   GET /api/roles/:id
// @access  Private
exports.getRole = async (req, res, next) => {
  try {
    const role = await Role.findById(req.params.id);
    
    if (!role) {
      return res.status(404).json({ success: false, message: 'Role not found' });
    }
    
    res.status(200).json({ success: true, data: role });
  } catch (err) {
    next(err);
  }
};

// @desc    Create role
// @route   POST /api/roles
// @access  Private/Admin
exports.createRole = async (req, res, next) => {
  try {
    const role = await Role.create(req.body);
    res.status(201).json({ success: true, data: role });
  } catch (err) {
    next(err);
  }
};

// @desc    Update role
// @route   PUT /api/roles/:id
// @access  Private/Admin
exports.updateRole = async (req, res, next) => {
  try {
    const role = await Role.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    
    if (!role) {
      return res.status(404).json({ success: false, message: 'Role not found' });
    }
    
    res.status(200).json({ success: true, data: role });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete role
// @route   DELETE /api/roles/:id
// @access  Private/Admin
exports.deleteRole = async (req, res, next) => {
  try {
    const role = await Role.findById(req.params.id);
    
    if (!role) {
      return res.status(404).json({ success: false, message: 'Role not found' });
    }
    
    await role.deleteOne();
    
    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    next(err);
  }
};
