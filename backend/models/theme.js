const ThemeSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  category: {
    type: String,
    enum: ['domino', 'table', 'background'],
    default: 'domino'
  },
  price: { type: Number, default: 0 },
  assets: {
    textureUrl: String, // Link to the image/sprite sheet
    cssClass: String    // The class name React frontend will apply
  }
});

const Theme = mongoose.model('Theme', ThemeSchema);