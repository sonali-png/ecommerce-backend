import express from "express";
const router = express.Router();
import { authMiddleware } from "../src/middlewares/authMiddleware.js";
import { getAddresses, save } from "../src/controllers/AddressController.js";

router.get("/", authMiddleware, getAddresses);
router.post("/", authMiddleware, save);
router.put("/", authMiddleware, save);
export default router;