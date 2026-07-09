import mongoose from "mongoose";
import Category from "../models/Category.js";

const variantSchema = new mongoose.Schema({
  category: { type: mongoose.Schema.Types.ObjectId, ref: "Category"},
  size: String,
  color: String,
});

const brandSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },

  slug: {
    type: String,
    unique: true
  },

  description: String,

  logo: {
    url: String,
    public_id: String
  },

  status: {
    type: Boolean,
    default: true
  },

  isDeleted: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });
export default mongoose.model("Brand", brandSchema);