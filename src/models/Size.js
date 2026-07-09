import mongoose from 'mongoose';

const sizeSchema = new mongoose.Schema({
  name: String,
  sortOrder: Number,
  status: Boolean,
  isDeleted: { type: Boolean, default: false}
}, { timestamps: true });

export default mongoose.model('Size', sizeSchema);
