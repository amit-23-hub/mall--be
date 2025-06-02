const express = require('express');
const {
  getRules,
  getRule,
  getRulesByRole,
  createRule,
  updateRule,
  deleteRule
} = require('../controllers/rules');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Apply protection to all routes
router.use(protect);

// Routes that all authenticated users can access
// Define the most specific routes first
router.get('/role/:roleId', getRulesByRole);

// General routes
router.get('/', getRules);

// Admin-only routes - moved before parameterized routes to prevent conflicts
router.post('/', authorize('admin', 'superadmin'), createRule);

// Parameterized routes (keep these last)
router.route('/:id')
  .get(getRule)
  .put(authorize('admin', 'superadmin'), updateRule)
  .delete(authorize('admin', 'superadmin'), deleteRule);

module.exports = router;
