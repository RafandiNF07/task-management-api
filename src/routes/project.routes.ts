import { Router } from "express";
import {createProject} from"../controllers/project.controller.js";
import {authenticateToken} from"../middleware/auth.middleware.js";

const router=Router();

router.post('/create', authenticateToken, createProject );

export default router;