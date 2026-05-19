import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import RefreshToken from "../src/models/RefreshToken.js";
import UserService from "../src/services/UserService.js";
const router = express.Router();
import { adminAuthMiddleware } from "../src/middlewares/AdminAuthMiddleware.js";

const ADMIN_ACCESS_SECRET = process.env.ADMIN_ACCESS_SECRET;
const ADMIN_REFRESH_SECRET = process.env.ADMIN_REFRESH_SECRET;

const generateAccessToken = (user) => 
  jwt.sign(
    { id: user._id, userId: user.userId }, 
    ADMIN_ACCESS_SECRET, 
    { expiresIn: "15m" }
  );
const generateRefreshToken = (user) => 
  jwt.sign(
    { id: user._id, userId: user.userId }, 
    ADMIN_REFRESH_SECRET, 
    { expiresIn: "3d" }
  );
router.get("/dashboard", (req, res) => {
    res.json({ message: "Admin dashboard" });
  }
);
router.post("/login", async (req, res) => {
  console.log(`req.body : ${JSON.stringify(req.body, null, 2)}`);
  const { email, password } = req.body;
  try {
    const user = await UserService.getDataByFieldName({ email:email });
    console.log(`user : ${user}`);
    const ADMIN = parseInt(process.env.ADMIN, 10);

    if (!user || user.role !== ADMIN) {
      return res.status(403).json({ message: "Not an admin", code: "NOT_ADMIN"  });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    console.log(`isMatch ${isMatch}`);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    const adminAccessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    await RefreshToken.create({
      token: refreshToken,
      userId: user.userId,
    });

    res.cookie("adminRefreshToken", refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: "Strict",
      path: "/"
    });

    res.json(
      { 
        adminAccessToken,
        user: {
          id: user._id,
          userId: user.userId,
          email: user.email,
          role:user.role
        }
      });
    
  }  catch (error) {
    res.json({"message":error.message});
  }
  
});
// Refresh with rotation + reuse detection
router.post("/refresh", async (req, res) => {
  const oldToken = req.cookies.adminRefreshToken;
  if (!oldToken) return res.sendStatus(403);

  const stored = await RefreshToken.findOne({ token: oldToken });
  if (!stored || !stored.valid) return res.status(401).json({ message: "Invalid refresh token" });

  jwt.verify(oldToken, ADMIN_REFRESH_SECRET, async (err, user) => {
    if (err) return res.sendStatus(403);

    if (stored.replacedBy) {
      //Reuse detected: revoke all tokens for this user
      await RefreshToken.updateMany({ userId: user.userId }, { valid: false });
      return res.status(403).json({ message: "Token reuse detected. All sessions revoked." });
    }

    // Normal rotation
    const adminAccessToken = generateAccessToken({ userId: user.userId });
    const newRefreshToken = generateRefreshToken({ userId: user.userId });

    stored.replacedBy = newRefreshToken;
    await stored.save();

    await RefreshToken.create({ token: newRefreshToken, userId: user.userId });

    res.cookie("adminRefreshToken", newRefreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: "Strict",
      path: "/"
    });
    console.log(`adminAccessToken from : auth ${adminAccessToken}`);
    res.json({ adminAccessToken });
  });
});

// Logout
router.post("/logout", async (req, res) => {
  const token = req.cookies.adminRefreshToken;
  if (token) {
    await RefreshToken.updateOne({ token }, { valid: false });
  }
  res.clearCookie("adminRefreshToken", {
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
  jwt.verify(token, ADMIN_ACCESS_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    res.json({ message: `Hello ${user.userId}, protected data here.` });
  });
});


router.get("/getadmindata", async (req, res) => {
  console.log(`Here in getAdmn`);
  try {
    const token = req.cookies.adminRefreshToken;

    if (!token) {
      return res.status(401).json({ message: "No token" });
    }

    const decoded = jwt.verify(token, ADMIN_REFRESH_SECRET);

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

export default router;