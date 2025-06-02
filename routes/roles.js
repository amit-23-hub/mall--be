const express = require('express');
const {
  getRoles,
  getRole,
  createRole,
  updateRole,
  deleteRole
} = require('../controllers/roles');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Apply protection to all routes
router.use(protect);

// General routes
router.get('/', getRoles);

// Admin-only routes - moved before parameterized routes to prevent conflicts
router.post('/', authorize('admin', 'superadmin'), createRole);

// Parameterized routes (keep these last)
router.route('/:id')
  .get(getRole)
  .put(authorize('admin', 'superadmin'), updateRole)
  .delete(authorize('admin', 'superadmin'), deleteRole);

module.exports = router;
