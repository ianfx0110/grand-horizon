# Grand Horizon Hotel Management System
By Ian Kipkoech

A sophisticated, full-stack hotel management system built with Vanilla JavaScript, HTML, CSS, Express, and PostgreSQL.

## Features
- **Responsive Multi-page Interface**: Optimized for both desktop and mobile devices.
- **Sophisticated Dark Theme**: Elegant and modern aesthetic reflecting Kenyan luxury standards.
- **Role-based Authentication**:
  - **Admin**: Full access to management.
  - **Hotel Attendant**: Can manage rooms and reservations.
- **Room Management**: Add, view, and track room statuses (Available, Occupied, Maintenance).
- **Reservation System**: Manage guest bookings with automated data tracking.
- **Dashboard Overview**: Real-time stats on occupancy, reservations, and room availability.

## Tech Stack
- **Frontend**: Vanilla HTML5, CSS3, JavaScript (ES6+).
- **Backend**: Node.js, Express.
- **Database**: PostgreSQL (via `pg`).
- **Styling**: Tailwind CSS & Pure CSS variables.

## Setup
1. Standard Node.js environment required.
2. **Database Configuration**: This application requires a PostgreSQL database. Set the `DATABASE_URL` environment variable to your connection string (e.g., `postgres://user:pass@host:port/db`).
3. Default user provided: `admin` / `admin123`.
4. New staff can register as Attendants directly from the Signup page.

## Project Structure
- `/public`: Frontend assets (HTML, JS).
- `/server.js`: Express server and PostgreSQL pool logic.
- `/schema.sql`: Database schema and initial seed data.
- `/src/index.css`: Tailwind configuration and global styles.
