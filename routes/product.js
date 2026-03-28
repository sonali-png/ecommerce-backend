import express from "express";
import { getProducts, getProductById, createProduct, getProductForm} from "../src/controllers/ProductController.js";
import multer from "multer";

const upload = multer({ dest: "uploads/" });

const router = express.Router();

router.get("/", getProducts);

router.get("/add", getProductForm);

router.post("/save", upload.array("images"), createProduct);
export default router;
