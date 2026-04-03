const mongoose = require('mongoose');

const GameSchema = new mongoose.Schema({
  status: { type: String, default: 'waiting' },
  players: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    hand: [[Number]],
    score: { type: Number, default: 0 }
  }],
  board: {
    line: [[Number]],
    endpoints: [Number]
  },
  turnIndex: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Game', GameSchema);