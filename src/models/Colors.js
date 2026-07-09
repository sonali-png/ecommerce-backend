import mongoose from 'mongoose';

const colorsSchema = new mongoose.Schema({
  name: String,
  image: String,
  hexCode: String,
  status: Boolean,
  isDeleted: { type: Boolean, default: false}
}, { timestamps: true });

export default mongoose.model('Colors', colorsSchema);
