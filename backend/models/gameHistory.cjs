const mongoose = require('mongoose');

const GameHistorySchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    guid: { type: String, unique: true },
    players: [{
        name:   { type: String, required: true }
    }],
    winners: [{
        name:   { type: String, required: true }
    }],
    losers: [{
        name:   { type: String, required: true }
    }],
    timeFinished: { type: Date, required: true, expires: '30d'} 
}, { timestamps: true });

module.exports = mongoose.model('GameHistory', GameHistorySchema);