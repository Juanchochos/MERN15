const mongoose = require('mongoose');

const GameHistorySchema = new mongoose.Schema({
    uid: { type: String, unique: true },
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
    timeFinished: { type: Date, required: true, expires: '30d'} 
}, { timestamps: true });

module.exports = mongoose.model('GameHistory', GameHistorySchema);