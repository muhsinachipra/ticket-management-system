// src\routes\userRoutes.ts

import { Router } from "express";
import { createUser, loginUser } from "../controllers/userController";
import { validateUserCreation, validateLogin } from "../validators/usersValidation";
import limiter from "../middleware/rateLimiter";

const router = Router();

router.post("/register", limiter, validateUserCreation, createUser);
router.post("/login", limiter, validateLogin, loginUser);

export default router;
