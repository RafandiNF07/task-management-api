import { Router } from "express";
import { registerUser } from "../controllers/user.controller.js";

const router = Router();

// Endpoint: POST /api/v1/users/register
router.post("/register", registerUser);

export default router;