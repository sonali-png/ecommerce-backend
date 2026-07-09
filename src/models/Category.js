import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  parentCategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    default: null
  },
  attributeIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Attributes"
  }]
  ,
  status: {
    type: Boolean,
    default: true
  },
  isDeleted: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

export default mongoose.model('Category', categorySchema);