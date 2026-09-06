import { Router } from "express";

const router =Router();
router.route("/register"); 
router.route("/login");
router.route("/add_to_activity");
router.route("/get_all_activity");

export default router;