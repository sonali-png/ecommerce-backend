// app.js
import express from "express";
import expressLayout from "express-ejs-layouts";
import productRoutes from "./routes/product.js";
import userRoutes from "./routes/user.js";
import categoryRoutes from "./routes/category.js";
import authRoutes from "./routes/auth.js";
import apiRoutes from "./routes/api.js";
import adminRoutes from "./routes/admin.js";
import wishlistRoutes from "./routes/wishlist.js";
import connectDB from "./src/config/db.js";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";


dotenv.config();
const app = express();

app.use(cors( {
  origin: "http://localhost:3000",
  credentials: true
}));

// View engine setup
app.set("view engine", "ejs");
app.use(expressLayout);
app.set("layout", "layout");

// Add bootstrap
// At the top of your file
import path from "path";
import { fileURLToPath } from "url";

// Equivalent of __filename and __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Now you can use __dirname safely
app.use('/bootstrap', express.static(path.join(__dirname, 'node_modules/bootstrap/dist')));
app.use('/bootstrap-icons', express.static(__dirname + '/node_modules/bootstrap-icons/font'));

//Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files
app.use(express.static("public"));

app.use(cookieParser());

// Routes

app.use("/", authRoutes);
app.use("/admin", adminRoutes);
app.use("/products", productRoutes);
app.use("/users", userRoutes);
app.use("/categories", categoryRoutes);
app.use("/wishlist", wishlistRoutes);
app.use("/api", apiRoutes);

const startServer = async (req, res) => {
  await connectDB();
  app.listen(5000, () => {
    console.log("Server running on port 5000");
  });
};
startServer();

