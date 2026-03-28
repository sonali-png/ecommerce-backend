import express from "express";
const Router = express.Router();
import { getCategories, createCategory, getCategoryForm } from "../src/controllers/CategoryController.js";
Router.get("/add", getCategoryForm);
Router.get("/", getCategories);
Router.post("/save", createCategory);
export default Router;