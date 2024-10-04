// src/controllers/userController.ts

import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { pool } from "../config/database";
import { Request, Response } from "express";
import { validationResult } from "express-validator";

// Create a new user
export const createUser = async (req: Request, res: Response) => {
  const { name, email, password, type } = req.body;

  // Validate incoming request data
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return
  }

  try {
    // Check if the email already exists
    const existingUser = await pool.query("SELECT id FROM users WHERE email = $1", [email]);
    if ((existingUser.rowCount ?? 0) > 0) {
      res.status(400).json({ error: "Email is already in use" });
      return
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      "INSERT INTO users (name, email, password, type) VALUES ($1, $2, $3, $4) RETURNING id, name, email",
      [name, email, hashedPassword, type]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Database Error: ", err);
    res.status(500).json({ error: "Error creating user" });
  }
};

// Login a user
export const loginUser = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  // Validate incoming request data
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return
  }

  try {
    const user = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (user.rowCount === 0) {
      res.status(404).json({ message: "User not found" });
      return
    }

    const isMatch = await bcrypt.compare(password, user.rows[0].password);
    if (!isMatch) {
      res.status(401).json({ message: "Invalid credentials" });
      return
    }

    const token = jwt.sign(
      { id: user.rows[0].id, type: user.rows[0].type },
      process.env.JWT_SECRET!,
      { expiresIn: "1h" }
    );

    // Set the token as a cookie in the response
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 3600000,  // 1 hour
    });
    res.status(200).json({ message: "Login successful",token });
  } catch (err) {
    console.error("Database Error: ", err);
    res.status(500).json({ error: "Error logging in" });
  }
};
