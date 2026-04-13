const mongoose = require('mongoose');

const GameHistorySchema = new mongoose.Schema({
    players: [{
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        name:   { type: String, required: true }
    }],
    winners: [{
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        name:   { type: String, required: true }
    }],
    losers: [{
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        name:   { type: String, required: true }
    }],
}, { timestamps: true });

module.exports = mongoose.model('GameHistory', GameHistorySchema);