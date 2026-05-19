  import jwt from "jsonwebtoken";

  export const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];

    try {
      
      const decoded = jwt.verify(token, process.env.USER_ACCESS_SECRET);
      console.log(`Token authHeader : ${decoded}`);
      req.user = decoded; // ✅ contains user id
      next();

    } catch (err) {
      // 🔥 Handle different JWT errors properly

      if (err.name === "TokenExpiredError") {
        return res.status(401).json({
          message: "Token expired",
          code: "TOKEN_EXPIRED"
        });
      }

      if (err.name === "JsonWebTokenError") {
        return res.status(401).json({
          message: "Invalid token",
          code: "INVALID_TOKEN"
        });
      }

      return res.status(500).json({
        message: "Authentication failed"
      });
    }
  };
  