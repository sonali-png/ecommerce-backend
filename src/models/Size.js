import mongoose from 'mongoose';

const sizeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
  },
  status: {
    type: Boolean,
    default: true
  },
  is_deleted: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

export default mongoose.model('Size', sizeSchema);
