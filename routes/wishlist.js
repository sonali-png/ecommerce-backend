import express from "express";
import Wishlist from "../src/models/Wishlist.js";
import { authMiddleware } from "../src/middlewares/authMiddleware.js";
const router = express.Router();

// Add to wishlist
router.post("/", authMiddleware, async (req, res) => {
  const { productId } = req.body;

  const wishlist = await Wishlist.findOneAndUpdate(
    { userId: req.user.id },
    { $addToSet: { products: productId } },
    { upsert: true, new: true }
  );

  res.json(wishlist);
});


// Remove from wishlist
router.delete("/:productId", authMiddleware, async (req, res) => {
  const { productId } = req.params;

  const wishlist = await Wishlist.findOneAndUpdate(
    { userId: req.user.id },
    { $pull: { products: productId } },
    { new: true }
  );
  res.json(wishlist);
});


// Get wishlist (with product details)
router.get("/", authMiddleware, async (req, res) => {
  let wishlist = await Wishlist.findOne({ userId: req.user.id }).populate("products");
  
  if(!wishlist) {
    wishlist = { products: []};
  }
  res.json(wishlist);
});


// Merge guest wishlist
router.post("/merge", authMiddleware, async (req, res) => {
  const { items } = req.body;

  const wishlist = await Wishlist.findOneAndUpdate(
    { userId: req.user.id },
    { $addToSet: { products: { $each: items } } },
    { upsert: true, new: true }
  );

  res.json(wishlist);
});

export default router;