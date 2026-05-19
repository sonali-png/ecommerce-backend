export const adminAuthMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: "No token" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.ADMIN_ACCESS_SECRET);
    console.log(`decoded `, decoded);

    req.user = decoded;

    if (req.user.role !== 1) {
      return res.status(403).json({ message: "Admin only" });
    }

    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};