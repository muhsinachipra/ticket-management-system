import { pool } from "../config/database";

const createUsersTable = async () => {
    const createTableQuery = `
        CREATE TABLE users (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            email VARCHAR(255) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL,
            type VARCHAR(20) CHECK (type IN ('admin', 'customers')) NOT NULL
        );
    `;

    try {
        await pool.query(createTableQuery);
        console.log("Users table created successfully.");
    } catch (error) {
        console.error("Error creating users table:", error);
    }
};

createUsersTable();
