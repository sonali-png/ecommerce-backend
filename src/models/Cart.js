import mongoose from "mongoose";

const CartItemSchema = new mongoose.Schema({
  productId: { type: String, required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, default: 1 }
});

const CartSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  items: [CartItemSchema]
}, { timestamps: true });

export default mongoose.model("Cart", CartSchema);
