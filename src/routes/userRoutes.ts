// src\routes\userRoutes.ts

import { Router } from "express";
import { createUser, loginUser } from "../controllers/userController";

const router = Router();

router.post("/register", createUser);
router.post("/login", loginUser); // here

export default router;
