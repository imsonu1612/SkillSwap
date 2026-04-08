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
connectionRequestSchema.index(
  { pairKey: 1, status: 1 },
  { unique: true, partialFilterExpression: { status: 'pending' } }
);

connectionRequestSchema.pre('validate', function(next) {
  if (this.from && this.to) {
    const [a, b] = [this.from.toString(), this.to.toString()].sort();
    this.pairKey = `${a}:${b}`;
  }
  next();
});

module.exports = mongoose.model('ConnectionRequest', connectionRequestSchema); 