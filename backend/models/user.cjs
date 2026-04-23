const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  login: { type: String, required: true, unique: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  stats: {
    gamesPlayed: { type: Number, default: 0 },
    wins: { type: Number, default: 0 },
    currency: { type: Number, default: 0 }
  },
  inventory: {
    themes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Theme' }]
  },
  settings: {
    activeDominoTheme: { type: mongoose.Schema.Types.ObjectId, ref: 'Theme' },
    activeTableTheme: { type: mongoose.Schema.Types.ObjectId, ref: 'Theme' }
  },
  loginVerificationCodeHash: { type: String, default: null },
  loginVerificationExpiresAt: { type: Date, default: null },
  passwordResetCodeHash: { type: String, default: null },
  passwordResetExpiresAt: { type: Date, default: null },
  passwordResetVerifiedExpiresAt: { type: Date, default: null }
});

module.exports = mongoose.model('User', UserSchema);
