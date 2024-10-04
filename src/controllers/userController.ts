// src\controllers\userController.ts

import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { pool } from "../config/database";
import { Request, Response } from "express";

// Create a new user
export const createUser = async (req: Request, res: Response) => {
  const { name, email, password, type } = req.body;
  try {
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
  try {
    const user = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    if (user.rowCount === 0) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.rows[0].password);
    if (!isMatch) {
      res.status(401).json({ message: "Invalid credentials" });
      return;
    }

    const token = jwt.sign(
      { id: user.rows[0].id, type: user.rows[0].type },
      process.env.JWT_SECRET!,
      { expiresIn: "1h" }
    );
    res.json({ token });
  } catch (err) {
    console.error("Database Error: ", err);
    res.status(500).json({ error: "Error logging in" });
  }
};
