import Cart from "../models/Cart.js";
export const createCodOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const { shippingAddress } = req.body;

    const cart = await Cart.findOne({ userId });

    if (!cart?.items?.length) {
      return res.status(400).json({
        message: "Your cart is empty.",
      });
    }

    const items = await getValidatedOrderItems(cart.items);

    const totalAmount = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    const order = await Order.create({
      userId,
      items,
      shippingAddress,
      totalAmount,
      paymentMethod: "COD",
      paymentStatus: "PENDING",
      orderStatus: "PLACED",
    });

    // Clear the cart only after order creation succeeds.
    await Cart.updateOne(
      { userId },
      { $set: { items: [] } }
    );

    return res.status(201).json({ order });
  } catch (error) {
    return res.status(400).json({
      message: error.message || "Unable to place order.",
    });
  }
};