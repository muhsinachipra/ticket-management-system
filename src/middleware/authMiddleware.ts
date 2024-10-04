// src\middleware\authMiddleware.ts

import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface User {
    id: number;
    type: 'admin' | 'customers';
}

declare global {
    namespace Express {
        interface Request {
            user: string | jwt.JwtPayload;
        }
    }
}

export const authenticateJWT = (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
        res.status(401).json({ error: "Unauthorized: No token provided" });
        return
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!);
        req.user = decoded;
        next();
    } catch (err) {
        res.status(401).json({ error: "Invalid token" });
        return
    }
};
