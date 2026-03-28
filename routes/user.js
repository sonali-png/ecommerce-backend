import express from "express";
import { createUser, getUsers} from "../src/controllers/UserController.js";

const router = express.Router();

router.get("/", getUsers);
router.get("/add", (req, res)=> {
    res.render("users/add", {title: "Add user"});
});
router.post("/save", createUser);
export default router;