const mongoose = require('mongoose');

const RuleSchema = new mongoose.Schema({
  roleId: {
    type: String,
    required: [true, 'Please specify which role this rule applies to']
  },
  title: {
    type: String,
    required: [true, 'Please provide a rule title'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Please provide a short description']
  },
  content: {
    type: String,
    required: [true, 'Please provide detailed rule content']
  },
  videoUrl: {
    type: String,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Rule', RuleSchema);
