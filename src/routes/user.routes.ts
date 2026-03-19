import { Router } from "express";
import { registerUser,loginUser,getMe } from "../controllers/user.controller.js";
import { authenticateToken } from "../middleware/auth.middleware.js";

const router = Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/getme', authenticateToken, getMe);

export default router