import mongoose from "mongoose";
const variantSchema = new mongoose.Schema({
  size: String,
  color: String,
  price: Number,
  discount: Number,
  stock: Number,
  sku: String
});

const imageSchema = new mongoose.Schema({
  url: String,
  public_id: String
});

const colorImageSchema = new mongoose.Schema({
  color: String,
  images: imageSchema
});

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },

  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category"
  },

  brand: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Brand"
  },

  description: String,

  variants: [variantSchema],

  colorImages: [colorImageSchema],

  thumbImage: [imageSchema],

  status: { type: Boolean, default: true }

}, { timestamps: true });

export default mongoose.model("Product", productSchema);