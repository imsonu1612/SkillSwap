const mongoose = require('mongoose');

const connectionRequestSchema = new mongoose.Schema({
  from: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  to: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending'
  },
  message: {
    type: String,
    maxlength: [200, 'Message cannot exceed 200 characters'],
    default: ''
  }
}, {
  timestamps: true
});

// Ensure unique connection requests
connectionRequestSchema.index({ from: 1, to: 1 }, { unique: true });

module.exports = mongoose.model('ConnectionRequest', connectionRequestSchema); 