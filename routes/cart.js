import express from "express";
const router = express.Router();
import Cart from "../src/models/Cart.js";

// 1. FETCH USER CART
// GET /api/cart/:userId
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    let cart = await Cart.findOne({ userId });

    // If no cart exists yet, return an empty array
    if (!cart) {
      return res.status(200).json({ items: [] });
    }

    res.status(200).json({ items: cart.items });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching cart', error: error.message });
  }
});

// 2. ADD TO USER CART
// POST /api/cart/:userId/add
router.post('/:userId/add', async (req, res) => {
  try {
    const { userId } = req.params;
    const { item } = req.body; // Expects shape: { id, name, price, quantity }

    let cart = await Cart.findOne({ userId });

    if (!cart) {
      // Create new cart if it doesn't exist
      cart = new Cart({
        userId,
        items: [{ productId: item.id, name: item.name, price: item.price, quantity: item.quantity || 1 }]
      });
    } else {
      // Check if product already exists in user's database cart
      const itemIndex = cart.items.findIndex(p => p.productId === item.id);

      if (itemIndex > -1) {
        // Product exists, increment quantity
        cart.items[itemIndex].quantity += (item.quantity || 1);
      } else {
        // Product does not exist, push new item
        cart.items.push({ productId: item.id, name: item.name, price: item.price, quantity: item.quantity || 1 });
      }
    }

    await cart.save();
    res.status(200).json({ items: cart.items });
  } catch (error) {
    res.status(500).json({ message: 'Error adding to cart', error: error.message });
  }
});

// 3. MERGE GUEST CART ON LOGIN
// POST /api/cart/:userId/merge
router.post('/:userId/merge', async (req, res) => {
  try {
    const { userId } = req.params;
    const { items: guestItems } = req.body; // Array of guest cart items from localStorage

    let cart = await Cart.findOne({ userId });

    if (!cart) {
      cart = new Cart({ userId, items: guestItems });
    } else {
      // User has an existing cart, merge guest items smartly
      guestItems.forEach(guestItem => {
        //check the index of product id combination with sku 
        const itemIndex = cart.items.findIndex(item => String(item.productId).trim() === guestItem.productId && item.sku === guestItem.sku);
        
        //if item exists with product id and sku in guest cart , add to existing quantity
        if (itemIndex > -1) {
          cart.items[itemIndex].quantity += guestItem.quantity;
        } else {
          // Push to cart if item is not exist
          cart.items.push(guestItem);
        }
      });
    }

    const cartResult = await cart.save();
    if(cartResult) {
      res.status(200).json({ message: "Product added to cart successfully" });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error merging cart', error: error.message });
  }
});
// REMOVE FROM USER CART
// POST /api/cart/:userId/remove
router.post('/:userId/remove', async (req, res) => {
  try {
    const { userId } = req.params;
    const { productId } = req.body;

    // Use MongoDB $pull operator to remove the item instantly
    const cart = await Cart.findOneAndUpdate(
      { userId },
      { $pull: { items: { productId: productId } } },
      { new: true } // Returns the modified document
    );

    if (!cart) {
      return res.status(200).json({ items: [] });
    }

    res.status(200).json({ items: cart.items });
  } catch (error) {
    res.status(500).json({ message: 'Error removing from cart', error: error.message });
  }
});
// UPDATE QUANTITY IN USER CART
// POST /api/cart/:userId/update-quantity
router.post('/:userId/update-quantity', async (req, res) => {
  try {
    const { userId } = req.params;
    const { productId, quantity } = req.body;

    const cart = await Cart.findOneAndUpdate(
      { userId, "items.productId": productId },
      { $set: { "items.$.quantity": quantity } },
      { new: true }
    );

    res.status(200).json({ items: cart ? cart.items : [] });
  } catch (error) {
    res.status(500).json({ message: 'Error updating quantity', error: error.message });
  }
});


export default router;