import { Router } from "express";
import { createProject, deleteProject, getProject, getProjectById, updateProject } from "../controllers/project.controller.js";
import { authenticateToken } from "../middleware/auth.middleware.js";
import { validate, validateData } from "../middleware/validate.middleware.js"; // Import senjata baru
import { projectSchema, projectIdSchema, updateProjectSchema } from "../validations/project.validation.js";

const router = Router();

// RUTE GET
router.get('/', 
    authenticateToken,
    getProject
);
router.get('/:id',
    authenticateToken,
    validateData(projectIdSchema,"params"),
    getProjectById
);

// RUTE POST (Gunakan helper 'validate' karena defaultnya body)
router.post('/create', 
    authenticateToken,
    validateData(projectSchema),
    createProject
);

// RUTE PATCH (Kombinasi params dan body)
router.patch('/:id', 
  authenticateToken, 
  validateData(projectIdSchema, "params"), 
  validate(updateProjectSchema), 
  updateProject
);

router.delete('/:id',
  authenticateToken,
  validateData(projectIdSchema,"params"),
  deleteProject
);

export default router;