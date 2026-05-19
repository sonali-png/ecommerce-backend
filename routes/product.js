import express from "express";
import upload from "../src/middlewares/upload.js";
import { 
    getProducts, 
    createProduct, 
    getProductForm, 
    getProductsByIds
} from "../src/controllers/ProductController.js";


const router = express.Router();

router.get("/", getProducts);
router.get("/add", getProductForm);
router.post("/bulk", getProductsByIds);
router.post("/save", upload.array("images", 5), createProduct);

export default router;
