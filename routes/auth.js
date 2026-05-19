import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import RefreshToken from "../src/models/RefreshToken.js";
import UserService from "../src/services/UserService.js";
const router = express.Router();
import User from "../src/models/User.js";
import { authMiddleware } from "../src/middlewares/authMiddleware.js";
import { adminAuthMiddleware } from "../src/middlewares/AdminAuthMiddleware.js";

const USER_ACCESS_SECRET = process.env.USER_ACCESS_SECRET;
const USER_REFRESH_SECRET = process.env.USER_REFRESH_SECRET;

const generateAccessToken = (user) => 
  jwt.sign(
    { id: user._id, userId: user.userId }, 
    USER_ACCESS_SECRET, 
    { expiresIn: "15m" }
  );
const generateRefreshToken = (user) => 
  jwt.sign(
    { id: user._id, userId: user.userId }, 
    USER_REFRESH_SECRET, 
    { expiresIn: "7d" }
  );

router.get("/getuserdata", authMiddleware, async (req, res) => {
  try {
    const token = req.cookies.userRefreshToken;

    if (!token) {
      return res.status(401).json({ message: "No token" });
    }

    const decoded = jwt.verify(token, USER_REFRESH_SECRET);

    // get user from DB
    const user = await UserService.getDataByFieldName({
      userId: decoded.userId
    }, "-password");


    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      user: {
        id: user._id,
        userId: user.userId,
        email: user.email,
        role:user.role,
        phone:user.phone,
        gender:user.gender, 
        firstName:user.firstName,
        lastName:user.lastName
      }
    });

  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
});

// Register
router.post("/register", async (req, res) => {
  const { userId, password } = req.body;
  const hashed = await bcrypt.hash(password, 10);
  users.push({ userId, password: hashed });
  res.json({ message: "User registered" });
});

// Login
router.post("/login", async (req, res) => {
  const { userId = "", email = "", password } = req.body;
  try {
    let query = {};
    if (email) query.email = email;
    else if (userId) query.userId = userId;
    const user = await UserService.getDataByFieldName(query);

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials from usr" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials from password" });
    }

    const userAccessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    await RefreshToken.create({
      token: refreshToken,
      userId: user.userId,
    });

    res.cookie("userRefreshToken", refreshToken, {
      httpOnly: true,
      secure: false, // make this true in production (HTTPS)
      sameSite: "Strict",
      path: "/"
    });

    res.json(
      { 
        userAccessToken,
        user: {
          id: user._id,
          userId: user.userId,
          email: user.email,
          role:user.role
        }
      });
  } catch (error) {
    console.log(`Login Error: ${error.message}`);
    res.status(500).json({ message: "Server error" });
  }
});

// Refresh with rotation + reuse detection
router.post("/refresh", async (req, res) => {
  const oldToken = req.cookies.userRefreshToken;
  if (!oldToken) return res.sendStatus(403);

  const stored = await RefreshToken.findOne({ token: oldToken });
  if (!stored || !stored.valid) return res.status(401).json({ message: "Invalid refresh token" });

  jwt.verify(oldToken, USER_REFRESH_SECRET, async (err, user) => {
    if (err) return res.sendStatus(403);

    if (stored.replacedBy) {
      //Reuse detected: revoke all tokens for this user
      await RefreshToken.updateMany({ userId: user.userId }, { valid: false });
      return res.status(403).json({ message: "Token reuse detected. All sessions revoked." });
    }

    // Normal rotation
    const userAccessToken = generateAccessToken({ userId: user.userId });
    const newRefreshToken = generateRefreshToken({ userId: user.userId });

    stored.replacedBy = newRefreshToken;
    await stored.save();

    await RefreshToken.create({ token: newRefreshToken, userId: user.userId });

    res.cookie("userRefreshToken", newRefreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: "Strict",
      path: "/"
    });
    console.log(`userAccessToken from : auth ${userAccessToken}`);
    res.json({ userAccessToken });
  });
});

// Logout
router.post("/logout", async (req, res) => {
  const token = req.cookies.userRefreshToken;
  if (token) {
    await RefreshToken.updateOne({ token }, { valid: false });
  }
  res.clearCookie("userRefreshToken", {
    httpOnly: true,
    sameSite: "Strict",
    path: "/"
  });
  res.json({ message: "Logged out successfully" });
});


// Protected route
router.get("/protected", (req, res) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.sendStatus(401);
  jwt.verify(token, USER_ACCESS_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    res.json({ message: `Hello ${user.userId}, protected data here.` });
  });
});

// Register
router.post("/register", async (req, res) => {
  const { userId, password } = req.body;
  const hashed = await bcrypt.hash(password, 10);
  users.push({ userId, password: hashed });
  res.json({ message: "User registered" });
});
router.post("/save", authMiddleware, async(req, res) => {
  const userData = req.body;
  try {
    const user = await User.findOneAndUpdate(
      { _id: req.user.id },
      { $set: userData },
      { returnDocument: "after", runValidators: true } 
    );
    res.json({
      user: {
        id: user._id,
        userId: user.userId,
        email: user.email,
        role:user.role,
        phone:user.phone,
        gender:user.gender, 
        firstName:user.firstName,
        lastName:user.lastName
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
  
    
});


export default router;