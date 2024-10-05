# Ticket Management System

This is a Ticket Management System API built with Node.js, TypeScript, and Express, using PostgreSQL for data storage. The API allows users to manage tickets for various events, including concerts, conferences, and sports.

## Table of Contents

- [Features](#features)
- [Technologies Used](#technologies-used)
- [Folder Structure](#folder-structure)
- [Environment Variables](#environment-variables)
- [Setup Instructions](#setup-instructions)
- [Running the Project](#running-the-project)
- [API Endpoints](#api-endpoints)
- [Contributing](#contributing)

## Features

- User authentication and authorization
- Create, read, update, and delete tickets
- Ticket analytics with filtering options
- Express validation for input data
- Rate limiting and middleware for improved security

## Technologies Used

- Node.js
- TypeScript
- Express
- PostgreSQL
- pgAdmin
- JWT for authentication

## Folder Structure

```
📦src
 ┣ 📂config
 ┃ ┗ 📜database.ts
 ┣ 📂controllers
 ┃ ┣ 📜ticketController.ts
 ┃ ┗ 📜userController.ts
 ┣ 📂middleware
 ┃ ┣ 📜authMiddleware.ts
 ┃ ┗ 📜rateLimiter.ts
 ┣ 📂models
 ┃ ┣ 📜Ticket.ts
 ┃ ┗ 📜User.ts
 ┣ 📂routes
 ┃ ┣ 📜ticketRoutes.ts
 ┃ ┗ 📜userRoutes.ts
 ┣ 📂scripts
 ┃ ┣ 📜createTicketsTable.ts
 ┃ ┗ 📜createUsersTable.ts
 ┣ 📂validators
 ┃ ┣ 📜ticketValidation.ts
 ┃ ┗ 📜usersValidation.ts
 ┗ 📜app.ts
```

## Environment Variables

Create a `.env` file in the root directory and add the following placeholders:

```
DB_HOST=your_database_host
DB_USER=your_database_username
DB_PASSWORD=your_database_password
DB_NAME=your_database_name
DB_PORT=your_database_port
JWT_SECRET=your_jwt_secret
```

## Setup Instructions

1. **Clone the repository:**

   ```bash
   git clone https://github.com/muhsinachipra/ticket-management-system.git
   cd ticket_management_system
   ```

2. **Install dependencies:**

   Make sure you have Node.js and npm installed, then run:

   ```bash
   npm install
   ```

3. **Set up the database:**

   - Ensure PostgreSQL is installed and running.
   - Create a new database with the name you specified in the `.env` file.
   - Run the following commands to create the necessary tables:

     ```bash
     npm run create-tickets-table
     npm run create-users-table
     ```

## Running the Project

You can start the application using:

```bash
npm start
```

The server will run on `http://localhost:3000`.

## API Endpoints

Here are some of the available endpoints:

- **GET** `/api/tickets` - Retrieve all tickets
- **GET** `/api/tickets/:id` - Retrieve a ticket by ID
- **POST** `/api/tickets` - Create a new ticket
- **PUT** `/api/tickets/:id` - Update an existing ticket
- **DELETE** `/api/tickets/:id` - Delete a ticket
- **GET** `/dashboard/analytics` - Get ticket analytics with optional query parameters

## Contributing

Contributions are welcome! Please feel free to submit a pull request or open an issue if you find any bugs or have suggestions for improvements.
