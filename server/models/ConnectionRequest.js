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
  pairKey: {
    type: String,
    required: true,
    index: true
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

// Keep a stable pair key regardless of request direction.
connectionRequestSchema.pre('validate', function(next) {
  if (!this.from || !this.to) {
    return next();
  }

  const [first, second] = [this.from.toString(), this.to.toString()].sort();
  this.pairKey = `${first}:${second}`;
  next();
});

module.exports = mongoose.model('ConnectionRequest', connectionRequestSchema); 