const mongoose = require('mongoose');

const GameSchema = new mongoose.Schema({
  players: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  }],
  winner: {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },
  loser: {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },
}, { timestamps: true });

module.exports = mongoose.model('GameHistory', GameHistorySchema);