// src\scripts\createTicketsTable.ts

import { pool } from "../config/database";

const createTicketsTable = async () => {
    const createTableQuery = `
        CREATE TABLE tickets (
            id SERIAL PRIMARY KEY,
            title VARCHAR(255) NOT NULL UNIQUE,
            description TEXT NOT NULL,
            type VARCHAR(20) CHECK (type IN ('concert', 'conference', 'sports')) NOT NULL,
            venue VARCHAR(255) NOT NULL,
            status VARCHAR(20) CHECK (status IN ('open', 'in-progress', 'closed')) NOT NULL,
            price NUMERIC(10, 2) NOT NULL,
            priority VARCHAR(20) CHECK (priority IN ('low', 'medium', 'high')) NOT NULL,
            due_date TIMESTAMP NOT NULL,
            created_at TIMESTAMP DEFAULT NOW(),
            created_by INTEGER NOT NULL,
            assigned_users TEXT[] DEFAULT '{}'
        );
    `;

    try {
        await pool.query(createTableQuery);
        console.log("Tickets table created successfully.");
    } catch (error) {
        console.error("Error creating tickets table:", error);
    }
};

createTicketsTable();
