# Placement Management System

A web application built with Next.js and MySQL to manage student placements and recruitment drives.

## Prerequisites

- Node.js (v18 or higher)
- MySQL Server

## Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/SrinjayDas/placement-mapping-system
   cd dbms_project
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Database Setup:**
   - Ensure your MySQL server is running.
   - The default configuration (in `src/lib/db.js` and migration scripts) expects:
     - **Host:** `localhost`
     - **User:** `root`
     - **Password:** `0000`
     - **Port:** `3306`
   - Create the database:
     ```sql
     CREATE DATABASE placement_db;
     ```
   - Ensure your `student` and `drive` tables are created in the database.

4. **Run Migrations:**
   Run the following scripts to update the database schema (adding passwords and max intake) and initialize the admin table:
   ```bash
   node migrate_db.js
   node migrate_admin.js
   node migrate_max_intake.js
   ```

## Running the Application

Start the development server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

## Admin Features

A new `admin` table has been added to handle administrative tasks and dashboard access.

### Admin Table Schema
| Column | Type | Description |
| --- | --- | --- |
| `AdminID` | INT | Primary Key, Auto-increment |
| `Username` | VARCHAR(50) | Unique username |
| `Password` | VARCHAR(255) | Login password |

### Default Admin Credentials
- **Username:** `admin`
- **Password:** `admin`

You can access the admin login at `/admin/login`.
