import mongoose from "mongoose";

const CUSTOMER = parseInt(process.env.CUSTOMER, 10);
const ADMIN = parseInt(process.env.ADMIN, 10);
const SELLER = parseInt(process.env.SELLER, 10);

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      trim: true,
    },
    
    gender: {
      type: String,
      trim: true,
    },

    email: {
      type: String,
      unique: true,
      sparse: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      // select: false,
    },

    role: {
      type: Number,
      enum: [CUSTOMER, ADMIN, SELLER],
      default: CUSTOMER,
    },

    phone: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    isPhoneVerified: {
      type: Boolean,
      default: false,
    },

    status: {
      type: Boolean,
      default: true,
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("User", userSchema);