// src\controllers\ticketController.ts

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
    const assigningUser = req.user as User;

    if (!userId) {
        res.status(400).json({ message: 'User ID is required' });
        return;
    }

    try {
        const ticketResult = await pool.query('SELECT * FROM tickets WHERE id = $1', [ticketId]);
        if (ticketResult.rows.length === 0) {
            res.status(404).json({ message: 'Ticket not found' });
            return
        }
        const ticket = ticketResult.rows[0];

        if (ticket.status === 'closed') {
            res.status(400).json({ message: 'Cannot assign users to a closed ticket' });
            return
        }

        if (assigningUser.id !== ticket.created_by && assigningUser.type !== 'admin') {
            res.status(403).json({ message: 'Unauthorized' });
            return
        }

        const assignedUsers = ticket.assigned_users || [];
        if (assignedUsers.includes(userId)) {
            res.status(400).json({ message: 'User already assigned' });
            return
        }

        const userResult = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
        if (userResult.rows.length === 0) {
            res.status(400).json({ message: 'User does not exist' });
            return
        }
        const user = userResult.rows[0];
        if (user.type === 'admin') {
            res.status(400).json({ message: 'You cannot assign a ticket to an admin' });
            return
        }

        if (assignedUsers.length >= 5) {
            res.status(400).json({ message: 'User assignment limit reached' });
            return
        }

        const updatedAssignedUsers = [...assignedUsers, userId];
        await pool.query('UPDATE tickets SET assigned_users = $1 WHERE id = $2', [updatedAssignedUsers, ticketId]);

        res.json({ message: 'User assigned successfully' });
        return

    } catch (err) {
        console.error('Database Error: ', err);
        res.status(500).json({ error: 'Error assigning user' });
        return
    }
};

export const getTicketDetails = async (req: Request, res: Response) => {
    const { ticketId } = req.params;

    try {
        const ticketResult = await pool.query(
            'SELECT id, title, description, type, venue, status, price, priority, due_date, created_by, assigned_users FROM tickets WHERE id = $1',
            [ticketId]
        );

        if (ticketResult.rows.length === 0) {
            res.status(404).json({ message: 'Ticket not found' });
            return
        }

        const ticket = ticketResult.rows[0];

        const assignedUsersResult = await pool.query(
            'SELECT id as "userId", name, email FROM users WHERE id = ANY($1)',
            [ticket.assigned_users]
        );

        const assignedUsers = assignedUsersResult.rows;

        const response = {
            id: ticket.id,
            title: ticket.title,
            description: ticket.description,
            type: ticket.type,
            venue: ticket.venue,
            status: ticket.status,
            price: ticket.price,
            priority: ticket.priority,
            dueDate: ticket.due_date,
            createdBy: ticket.created_by,
            assignedUsers,
            statistics: {
                totalAssigned: assignedUsers.length,
                status: ticket.status
            }
        };

        res.json(response);
    } catch (err) {
        console.error('Database Error: ', err);
        res.status(500).json({ error: 'Error retrieving ticket details' });
    }
};


export const getTicketAnalytics = async (req: Request, res: Response) => {
    const { startDate, endDate, status, priority, type, venue } = req.query;
    const filters: string[] = [];
    const queryParams: any[] = [];

    try {
        let query = 'SELECT * FROM tickets WHERE 1=1';

        if (startDate) {
            filters.push('created_at >= $' + (filters.length + 1));
            queryParams.push(startDate);
        }

        if (endDate) {
            filters.push('created_at <= $' + (filters.length + 1));
            queryParams.push(endDate);
        }

        if (status) {
            filters.push('status = $' + (filters.length + 1));
            queryParams.push(status);
        }

        if (priority) {
            filters.push('priority = $' + (filters.length + 1));
            queryParams.push(priority);
        }

        if (type) {
            filters.push('type = $' + (filters.length + 1));
            queryParams.push(type);
        }

        if (venue) {
            filters.push('venue = $' + (filters.length + 1));
            queryParams.push(venue);
        }

        if (filters.length > 0) {
            query += ' AND ' + filters.join(' AND ');
        }

        const ticketResult = await pool.query(query, queryParams);
        const tickets = ticketResult.rows;

        const totalTickets = tickets.length;
        const closedTickets = tickets.filter(ticket => ticket.status === 'closed').length;
        const openTickets = tickets.filter(ticket => ticket.status === 'open').length;
        const inProgressTickets = tickets.filter(ticket => ticket.status === 'in-progress').length;

        const priorityDistribution = {
            low: tickets.filter(ticket => ticket.priority === 'low').length,
            medium: tickets.filter(ticket => ticket.priority === 'medium').length,
            high: tickets.filter(ticket => ticket.priority === 'high').length,
        };

        const typeDistribution = {
            concert: tickets.filter(ticket => ticket.type === 'concert').length,
            conference: tickets.filter(ticket => ticket.type === 'conference').length,
            sports: tickets.filter(ticket => ticket.type === 'sports').length,
        };

        res.json({
            totalTickets,
            closedTickets,
            openTickets,
            inProgressTickets,
            priorityDistribution,
            typeDistribution,
            tickets: tickets.map(ticket => ({
                id: ticket.id,
                title: ticket.title,
                status: ticket.status,
                priority: ticket.priority,
                type: ticket.type,
                venue: ticket.venue,
                createdDate: ticket.created_at,
                createdBy: ticket.created_by,
            })),
        });
    } catch (err) {
        console.error('Database Error: ', err);
        res.status(500).json({ error: 'Error fetching ticket analytics' });
    }
};

export const getTicketDashboardAnalytics = async (req: Request, res: Response) => {
    const { startDate, endDate, status, priority, type, venue } = req.query;
    const filters: string[] = [];
    const queryParams: any[] = [];

    try {
        let query = 'SELECT * FROM tickets WHERE 1=1';

        if (startDate) {
            filters.push('created_at >= $' + (filters.length + 1));
            queryParams.push(startDate);
        }

        if (endDate) {
            filters.push('created_at <= $' + (filters.length + 1));
            queryParams.push(endDate);
        }

        if (status) {
            filters.push('status = $' + (filters.length + 1));
            queryParams.push(status);
        }

        if (priority) {
            filters.push('priority = $' + (filters.length + 1));
            queryParams.push(priority);
        }

        if (type) {
            filters.push('type = $' + (filters.length + 1));
            queryParams.push(type);
        }

        if (venue) {
            filters.push('venue = $' + (filters.length + 1));
            queryParams.push(venue);
        }

        if (filters.length > 0) {
            query += ' AND ' + filters.join(' AND ');
        }

        const ticketResult = await pool.query(query, queryParams);
        const tickets = ticketResult.rows;

        const totalTickets = tickets.length;
        const closedTickets = tickets.filter(ticket => ticket.status === 'closed').length;
        const openTickets = tickets.filter(ticket => ticket.status === 'open').length;
        const inProgressTickets = tickets.filter(ticket => ticket.status === 'in-progress').length;

        const customerSpendingResult = await pool.query('SELECT AVG(price) as averageCustomerSpending FROM tickets');
        const averageCustomerSpending = customerSpendingResult.rows[0].averageCustomerSpending || 0;

        const ticketsPerDayResult = await pool.query('SELECT COUNT(*) as totalTicketsBooked, COUNT(DISTINCT DATE(created_at)) as totalDays FROM tickets');
        const averageTicketsBookedPerDay = ticketsPerDayResult.rows[0].totalTicketsBooked / (ticketsPerDayResult.rows[0].totalDays || 1);

        const priorityDistribution = {
            low: tickets.filter(ticket => ticket.priority === 'low').length,
            averageLowTicketsBookedPerDay: (tickets.filter(ticket => ticket.priority === 'low').length / (ticketsPerDayResult.rows[0].totalDays || 1)) || 0,
            medium: tickets.filter(ticket => ticket.priority === 'medium').length,
            averageMediumTicketsBookedPerDay: (tickets.filter(ticket => ticket.priority === 'medium').length / (ticketsPerDayResult.rows[0].totalDays || 1)) || 0,
            high: tickets.filter(ticket => ticket.priority === 'high').length,
            averageHighTicketsBookedPerDay: (tickets.filter(ticket => ticket.priority === 'high').length / (ticketsPerDayResult.rows[0].totalDays || 1)) || 0,
        };

        const typeDistribution = {
            concert: tickets.filter(ticket => ticket.type === 'concert').length,
            conference: tickets.filter(ticket => ticket.type === 'conference').length,
            sports: tickets.filter(ticket => ticket.type === 'sports').length,
        };

        res.json({
            totalTickets,
            closedTickets,
            openTickets,
            averageCustomerSpending,
            averageTicketsBookedPerDay,
            inProgressTickets,
            priorityDistribution,
            typeDistribution,
        });
    } catch (err) {
        console.error('Database Error: ', err);
        res.status(500).json({ error: 'Error fetching ticket analytics' });
    }
};