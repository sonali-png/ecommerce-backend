import express from "express";
const Router = express.Router();
import { getBrands, createBrand, getBrandByCategoryId } from "../src/controllers/BrandController.js";
Router.get("/", getBrands);
Router.get("/save", createBrand);
Router.get("/by-category", getBrandByCategoryId);
export default Router;