import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import RefreshToken from "../src/models/RefreshToken.js";
import UserService from "../src/services/UserService.js";
const router = express.Router();

console.log("Inside auth.js");
const ACCESS_SECRET = process.env.ACCESS_SECRET;
const REFRESH_SECRET = process.env.REFRESH_SECRET;

const generateAccessToken = (user) => 
  jwt.sign(
    { id: user._id, username: user.userName }, 
    ACCESS_SECRET, 
    { expiresIn: "15m" }
  );
const generateRefreshToken = (user) => 
  jwt.sign(
    { id: user._id, username: user.userName }, 
    REFRESH_SECRET, 
    { expiresIn: "7d" }
  );

router.get("/getuserdata", async (req, res) => {
  try {
    const token = req.cookies.refreshToken;

    if (!token) {
      return res.status(401).json({ message: "No token" });
    }

    const decoded = jwt.verify(token, REFRESH_SECRET);

    // get user from DB
    const user = await UserService.getDataByFieldName({
      userName: decoded.username
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      user: {
        id: user._id,
        username: user.userName,
        email: user.email,
        role:user.role
      }
    });

  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
});

// Register
router.post("/register", async (req, res) => {
  const { username, password } = req.body;
  const hashed = await bcrypt.hash(password, 10);
  users.push({ username, password: hashed });
  res.json({ message: "User registered" });
});

// Login
router.post("/login", async (req, res) => {
  const { username = "", email = "", password } = req.body;

  try {
    let query = {};
    if (email) query.email = email;
    else if (username) query.userName = username;

    const user = await UserService.getDataByFieldName(query);

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    await RefreshToken.create({
      token: refreshToken,
      username: user.userName,
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false, // make this true in production (HTTPS)
      sameSite: "Strict",
      path: "/"
    });

    res.json(
      { 
        accessToken,
        user: {
          id: user._id,
          username: user.userName,
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
  const oldToken = req.cookies.refreshToken;
  if (!oldToken) return res.sendStatus(403);

  const stored = await RefreshToken.findOne({ token: oldToken });
  if (!stored || !stored.valid) return res.sendStatus(403);

  jwt.verify(oldToken, REFRESH_SECRET, async (err, user) => {
    if (err) return res.sendStatus(403);

    if (stored.replacedBy) {
      //Reuse detected: revoke all tokens for this user
      await RefreshToken.updateMany({ username: user.username }, { valid: false });
      return res.status(403).json({ message: "Token reuse detected. All sessions revoked." });
    }

    // Normal rotation
    const accessToken = generateAccessToken({ username: user.username });
    const newRefreshToken = generateRefreshToken({ username: user.username });

    stored.replacedBy = newRefreshToken;
    await stored.save();

    await RefreshToken.create({ token: newRefreshToken, username: user.username });

    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: "Strict",
      path: "/"
    });
    res.json({ accessToken });
  });
});

// Logout
router.post("/logout", async (req, res) => {
  const token = req.cookies.refreshToken;
  if (token) {
    await RefreshToken.updateOne({ token }, { valid: false });
  }
  res.clearCookie("refreshToken", {
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
  jwt.verify(token, ACCESS_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    res.json({ message: `Hello ${user.username}, protected data here.` });
  });
});


export default router;