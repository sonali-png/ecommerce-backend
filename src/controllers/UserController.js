
import UserService from "../services/UserService.js";
import User from "../models/User.js";
import RefreshToken from "../models/RefreshToken.js";
import { generateHashedPasswords } from "../utils/generatehashedpwd.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const USER_ACCESS_SECRET = process.env.USER_ACCESS_SECRET;
const USER_REFRESH_SECRET = process.env.USER_REFRESH_SECRET;

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
  path: "/",
};

const generateAccessToken = (user) =>
  jwt.sign(
    {
      id: user._id ?? user.id,
    },
    USER_ACCESS_SECRET,
    { expiresIn: "15m" }
  );

const generateRefreshToken = (user) =>
  jwt.sign(
    {
      id: user._id ?? user.id,
    },
    USER_REFRESH_SECRET,
    { expiresIn: "7d" }
  );

const getPublicUser = (user) => ({
  id: user._id,
  email: user.email,
  role: user.role,
  phone: user.phone,
  gender: user.gender,
  fullName: user.fullName
});

// REGISTER
export const registerUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const existingUser = await UserService.getDataByFieldName({
      email,
    });

    if (existingUser) {
      return res.status(409).json({
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await UserService.createUser({
      ...req.body,
      password: hashedPassword,
    });

    return res.status(201).json({
      message: "User registered successfully",
      user: getPublicUser(user),
    });
  } catch (error) {
    console.error("Register Error:", error.message);
    return res.status(500).json({
      message: "Server error",
    });
  }
};

// LOGIN
export const loginUser = async (req, res) => {
  try {
    const { email = "", password } = req.body;
    if ((!email) || !password) {
      return res.status(400).json({
        message: "email and password are required",
      });
    }
    const query = email ? { email } : "";
    if(query) {
      const user = await UserService.getDataByFieldName(query);
      if (!user || !user.password) {
        return res.status(401).json({
          message: "Invalid credentials",
        });
      }
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({
          message: "Invalid credentials",
        });
      }

      const userAccessToken = generateAccessToken(user);
      const refreshToken = generateRefreshToken(user);
      await RefreshToken.create({
        token: refreshToken,
        id: user._id,
      });
      res.cookie("userRefreshToken", refreshToken, cookieOptions);
      return res.json({
        userAccessToken,
        user: getPublicUser(user),
      });
    }
  } catch (error) {
    console.error("Login Error:", error.message);
    return res.status(500).json({
      message: "Server error",
    });
  }
};

// GET LOGGED-IN USER DATA

export const getUserData = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select(
            "-password"
        );

        if (!user) {
            return res.status(404).json({
                message: "User not found",
            });
        }

        return res.json({
            user: getPublicUser(user),
        });
    } catch (error) {
        console.error("Get User Data Error:", error.message);

        return res.status(500).json({
            message: "Server error",
        });
    }
};

// REFRESH ACCESS TOKEN WITH ROTATION
export const refreshUserToken = async (req, res) => {
  try {
    const oldToken = req.cookies?.userRefreshToken;

    if (!oldToken) {
      return res.status(401).json({
        message: "Refresh token missing",
      });
    }

    const stored = await RefreshToken.findOne({
      token: oldToken,
    });

    if (!stored) {
      return res.status(401).json({
        message: "Invalid refresh token",
      });
    }

    if (stored.replacedBy) {
      const decoded = jwt.verify(
        oldToken,
        USER_REFRESH_SECRET
      );

      await RefreshToken.updateMany(
        { id: decoded.id },
        { $set: { valid: false } }
      );

      res.clearCookie("userRefreshToken", cookieOptions);

      return res.status(403).json({
        message: "Token reuse detected. Sessions revoked.",
      });
    }

    if (!stored.valid) {
      return res.status(401).json({
        message: "Invalid refresh token",
      });
    }

    const decoded = jwt.verify(
      oldToken,
      USER_REFRESH_SECRET
    );

    const user = await UserService.getDataByFieldName({
      _id: decoded.id,
    });

    if (!user) {
      return res.status(401).json({
        message: "User not found",
      });
    }

    const userAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);

    stored.valid = false;
    stored.replacedBy = newRefreshToken;
    await stored.save();

    await RefreshToken.create({
      token: newRefreshToken,
      id: user._id,
    });

    res.cookie(
      "userRefreshToken",
      newRefreshToken,
      cookieOptions
    );

    return res.json({ userAccessToken });
  } catch (error) {
    if (error.name === "TokenExpiredError" ||
        error.name === "JsonWebTokenError") {
      return res.status(401).json({
        message: "Refresh token expired or invalid",
      });
    }

    console.error("Refresh Error:", error.message);
    return res.status(500).json({
      message: "Server error",
    });
  }
};

// LOGOUT
export const logoutUser = async (req, res) => {
  try {
    const token = req.cookies?.userRefreshToken;

    if (token) {
      await RefreshToken.updateOne(
        { token },
        { $set: { valid: false } }
      );
    }

    res.clearCookie("userRefreshToken", cookieOptions);

    return res.json({
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error("Logout Error:", error.message);
    return res.status(500).json({
      message: "Server error",
    });
  }
};

// PROTECTED ROUTE
export const getProtectedData = (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(" ")[1];

  if (!token) {
    return res.sendStatus(401);
  }

  try {
    const decoded = jwt.verify(token, USER_ACCESS_SECRET);

    return res.json({
      message: `Hello ${decoded._id}, protected data here.`,
    });
  } catch (error) {
    return res.sendStatus(403);
  }
};

// SAVE USER PROFILE
export const saveUser = async (req, res) => {
  try {
    // Allow only profile fields to be updated.
    const allowedFields = [
      "email",
      "phone",
      "gender",
      "fullName"
    ];

    const userData = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        userData[field] = req.body[field];
      }
    }

    const user = await User.findOneAndUpdate(
      { _id: req.user.id },
      { $set: userData },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    return res.json({
      user: getPublicUser(user),
    });
  } catch (error) {
    console.error("Save User Error:", error.message);
    return res.status(400).json({
      message: "Unable to update profile",
    });
  }
};
