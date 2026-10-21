
import express from "express";
import {
  createRazorpayOrder,
  verifyRazorpayPayment,
} from  "../src/controllers/PaymentController.js";
import { authMiddleware } from "../src/middlewares/authMiddleware.js";

const router = express.Router();

router.post("/order", authMiddleware, createRazorpayOrder);
router.post("/verify", authMiddleware, verifyRazorpayPayment);

export default router;
