import { validationResult } from 'express-validator';
import { pool } from '../config/database';
import { Request, Response } from 'express';

export interface User {
    id: number;
    type: 'admin' | 'customers';
}

export const createTicket = async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return
    }

    const { title, description, type, venue, status, price, priority, dueDate } = req.body;
    const user = req.user as User;
    const createdBy = user.id
    try {
        const userCheck = await pool.query("SELECT id FROM users WHERE id = $1", [createdBy]);
        if (userCheck.rows.length === 0) {
            res.status(400).json({ error: "Invalid user: createdBy does not exist" });
            return
        }

        const result = await pool.query(
            'INSERT INTO tickets (title, description, type, venue, status, price, priority, due_date, created_by, assigned_users) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id, title, description, type, venue, status, price, priority, due_date, created_by, assigned_users',
            [title, description, type, venue, status, price, priority, dueDate, createdBy, '{}']
        );

        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error("Database Error: ", err);
        res.status(500).json({ error: 'Error creating ticket' });
    }
};

export const assignUserToTicket = async (req: Request, res: Response) => {
    const { ticketId } = req.params;
    const { userId } = req.body;
    try {
        // Fetch ticket to ensure it's open and check constraints
        const ticket = await pool.query('SELECT * FROM tickets WHERE id = $1', [ticketId]);
        if (ticket.rows[0].status === 'closed') {
            res.status(400).json({ message: 'Cannot assign users to a closed ticket' });
            return
        }

        // Update ticket's assignedUsers
        await pool.query('UPDATE tickets SET assigned_users = assigned_users || $1 WHERE id = $2', [`"${userId}"`, ticketId]);
        res.json({ message: 'User assigned successfully' });
    } catch (err) {
        console.error("Database Error: ", err);
        res.status(500).json({ error: 'Error assigning user' });
    }
};
