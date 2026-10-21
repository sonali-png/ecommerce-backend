
import crypto from "crypto";

import razorpay from "../config/razorpay.js";
import Cart from "../models/Cart.js";
import Product from "../models/Product.js";
import Order from "../models/Order.js";

// Here, a cart item's sku is assumed to match a variant's sku.
async function getValidatedOrderItems(cartItems) {
  const orderItems = [];

  for (const item of cartItems) {
    const product = await Product.findById(item.productId);

    if (!product) {
      throw new Error("A product in your cart is no longer available.");
    }

    const variant = product.variants.find(
      (v) => v.sku && v.sku === item.sku
    );

    if (!variant) {
      throw new Error(
        `Please reselect the variant for ${product.name}.`
      );
    }

    if (variant.stock < item.quantity) {
      throw new Error(
        `Insufficient stock for ${product.name}.`
      );
    }

    orderItems.push({
      productId: product._id,
      sku: item.sku,
      quantity: item.quantity,
      price: variant.price,
      color: item.color,
      selectedVariants: item.selectedVariants,
    });
  }

  return orderItems;
}

export const createRazorpayOrder = async (req, res) => {
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

    // Amounts in the database are assumed to be rupees.
    const totalAmount = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    if (!Number.isFinite(totalAmount) || totalAmount <= 0) {
      return res.status(400).json({
        message: "Invalid order amount.",
      });
    }

    // Razorpay requires the amount in paise for INR.
    const amountInPaise = Math.round(totalAmount * 100);

    // Create your application order first.
    const appOrder = await Order.create({
      userId,
      items,
      shippingAddress,
      totalAmount,
      paymentMethod: "ONLINE",
      paymentStatus: "PENDING",
      orderStatus: "PENDING_PAYMENT",
    });

    const rpOrder = await razorpay.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt: appOrder._id.toString(),
      notes: {
        appOrderId: appOrder._id.toString(),
      },
    });

    appOrder.razorpayOrderId = rpOrder.id;
    await appOrder.save();

    return res.status(201).json({
      appOrderId: appOrder._id,
      orderId: rpOrder.id,
      amount: rpOrder.amount,
      currency: rpOrder.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    return res.status(400).json({
      message: error.message || "Unable to create payment order.",
    });
  }
};

export const verifyRazorpayPayment = async (req, res) => {
  try {
    const userId = req.user.id;

    const {
      appOrderId,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    const order = await Order.findOne({
      _id: appOrderId,
      userId,
      paymentMethod: "ONLINE",
    });

    if (!order) {
      return res.status(404).json({
        message: "Order not found.",
      });
    }

    // Do not trust an order ID supplied only by the browser.
    if (order.razorpayOrderId !== razorpay_order_id) {
      return res.status(400).json({
        message: "Payment order does not match.",
      });
    }

    // Idempotent response if this order was already confirmed.
    if (order.paymentStatus === "PAID") {
      return res.json({ success: true, orderId: order._id });
    }

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${order.razorpayOrderId}|${razorpay_payment_id}`)
      .digest("hex");

    const received = Buffer.from(razorpay_signature || "", "hex");
    const expected = Buffer.from(expectedSignature, "hex");

    if (
      received.length !== expected.length ||
      !crypto.timingSafeEqual(received, expected)
    ) {
      return res.status(400).json({
        message: "Invalid payment signature.",
      });
    }

    // Confirm payment details with Razorpay as an extra check.
    const payment = await razorpay.payments.fetch(
      razorpay_payment_id
    );

    if (
      payment.order_id !== order.razorpayOrderId ||
      payment.amount !== Math.round(order.totalAmount * 100) ||
      payment.currency !== "INR"
    ) {
      return res.status(400).json({
        message: "Payment details do not match the order.",
      });
    }

    // This example expects automatic capture to be enabled.
    if (payment.status !== "captured") {
      return res.status(409).json({
        message: "Payment is not captured yet. Please check again.",
      });
    }

    order.razorpayPaymentId = razorpay_payment_id;
    order.paymentStatus = "PAID";
    order.orderStatus = "PLACED";
    await order.save();

    // Clear the cart only after confirmed payment.
    await Cart.updateOne(
      { userId },
      { $set: { items: [] } }
    );

    return res.json({
      success: true,
      orderId: order._id,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Payment verification failed.",
    });
  }
};
