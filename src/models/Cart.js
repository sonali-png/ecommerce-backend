import mongoose from "mongoose";

const CartItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Products",
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    default: 1
  },
  color: {
    type: String,
    default: null
  },
  sku: {
    type: String,
    required: true
  },
  selectedVariants: [
    {
      attributeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Attributes",
        required: true
      },
      value: {
        type: String,
        required: true
      }
    }
  ]
});
const CartSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "users", required: true },
  items: [CartItemSchema]
}, { timestamps: true });

export default mongoose.model("Cart", CartSchema);
