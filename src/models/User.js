import mongoose from 'mongoose';

const CUSTOMER = parseInt(process.env.CUSTOMER, 10);
const ADMIN = parseInt(process.env.ADMIN, 10);
const SELLER = parseInt(process.env.SELLER, 10);

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  userName: {
    type:String,
    trim:true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },

  password: {
    type: String,
    required: true
  },

  role: {
    type: Number,
    enum: [CUSTOMER, ADMIN, SELLER],
    default: CUSTOMER
  },

  phone: {
    type: String,
    default: ''
  },

  address: {
    type: String,
    default: ''
  },

  isActive: {
    type: Boolean,
    default: true
  },

  isDeleted: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

export default mongoose.model('User', userSchema);
