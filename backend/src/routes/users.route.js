import { Router } from "express";
import { registerUser, loginUser,addToHistory,getUserHistory } from "../controllers/user.controller.js";

const router =Router();
router.route("/register").post(registerUser); 
router.route("/login").post(loginUser);
router.route("/add_to_activity").post(addToHistory);
router.route("/get_all_activity").get(getUserHistory);

export default router;