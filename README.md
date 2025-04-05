
# PostgreSQL Data Manager

A simple data management application that connects to a local PostgreSQL database, allowing you to browse tables, and perform CRUD operations on your data.

## Setup Instructions

### Prerequisites

- Node.js (v14+)
- npm or yarn
- PostgreSQL database

### Installation

1. Clone the repository

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with your PostgreSQL credentials:
```
DB_USER=postgres
DB_HOST=localhost
DB_NAME=postgres
DB_PASSWORD=postgres
DB_PORT=5432
PORT=5000
```

4. Start the backend server:
```bash
node server.js
```

5. Start the frontend development server:
```bash
npm run dev
```

6. Open your browser and navigate to: `http://localhost:8080`

## Features

- Connect to any PostgreSQL database
- Browse available tables
- View table data in a clean, responsive interface
- Create new records
- Edit existing records
- Delete records

## Technologies

- Frontend: React, TypeScript, Tailwind CSS, shadcn/ui
- Backend: Node.js, Express
- Database: PostgreSQL
