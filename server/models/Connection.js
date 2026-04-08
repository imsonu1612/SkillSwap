const mongoose = require('mongoose');

const connectionSchema = new mongoose.Schema({
  user1: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  user2: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  pairKey: {
    type: String,
    required: true,
    unique: true
  },
  connectedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Ensure unique connections
connectionSchema.index({ user1: 1, user2: 1 }, { unique: true });
connectionSchema.index({ pairKey: 1 }, { unique: true });

connectionSchema.pre('validate', function(next) {
  if (this.user1 && this.user2) {
    const [a, b] = [this.user1.toString(), this.user2.toString()].sort();
    this.pairKey = `${a}:${b}`;
  }
  next();
});

module.exports = mongoose.model('Connection', connectionSchema); 