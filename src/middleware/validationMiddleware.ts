// src\middleware\validationMiddleware.ts

import { body } from "express-validator";

export const validateUserCreation = [
    body("name").notEmpty().withMessage("Name is required"),
    body("email")
        .isEmail()
        .withMessage("Must be a valid email address")
        .normalizeEmail(),
    body("password")
        .isLength({ min: 8 })
        .withMessage("Password must be at least 8 characters long")
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]*$/, "g")
        .withMessage("Password must contain at least one uppercase letter, one lowercase letter, and one number"),
    body("type")
        .isIn(["admin", "customers"])
        .withMessage("Invalid user type. Must be 'admin' or 'customers'"),
];

export const validateLogin = [
    body("email")
        .isEmail()
        .withMessage("Must be a valid email address")
        .normalizeEmail(),
    body("password")
        .isLength({ min: 6 })
        .withMessage("Password must be at least 6 characters long"),
];
