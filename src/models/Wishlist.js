import mongoose from "mongoose";

const wishlistSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    products: [
        { type: mongoose.Schema.Types.ObjectId, ref: "Product" }
    ],
    isDeleted: { type: Boolean, default: false }
});
export default mongoose.model("Wishlist", wishlistSchema);