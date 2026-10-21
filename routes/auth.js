
import express from "express";

import {
  registerUser,
  loginUser,
  getUserData,
  refreshUserToken,
  logoutUser,
  getProtectedData,
  saveUser
} from "../src/controllers/UserController.js";

import {
  sendOtp,
  verifyOtp
} from "../src/controllers/PhoneAuthController.js";

import { authMiddleware } from "../src/middlewares/authMiddleware.js";

const router = express.Router();

console.log("Here in auth ")

// Registration and login
router.post("/register", registerUser);
router.post("/login", loginUser);

// User data
router.get("/getuserdata", authMiddleware, getUserData);

// Token management
router.post("/refresh", refreshUserToken);
router.post("/logout", logoutUser);

// Protected endpoints - tokens 
router.get("/protected", getProtectedData);
router.post("/save", authMiddleware, saveUser);

// OTP authentication
router.post("/phone/send-otp", sendOtp);
router.post("/phone/verify-otp", verifyOtp);

export default router;
