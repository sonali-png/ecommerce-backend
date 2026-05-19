import mongoose from "mongoose";

const brandSchema = new mongoose.Schema({
  name: { type: String, required: true },
  logo: String,
  slug: { type: String, unique: true },
  status: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.model("Brand", brandSchema);