# Grand Horizon Hotel Management System
By Ian Kipkoech

A sophisticated, full-stack hotel management system built with Vanilla JavaScript, HTML, CSS, Express, and Better-SQLite3.

## Features
- **Responsive Multi-page Interface**: Optimized for both desktop and mobile devices.
- **Sophisticated Dark Theme**: Elegant and modern aesthetic reflecting hotel luxury.
- **Role-based Authentication**:
  - **Admin**: Full access to management.
  - **Hotel Attendant**: Can manage rooms and reservations.
- **Room Management**: Add, view, and track room statuses (Available, Occupied, Maintenance).
- **Reservation System**: Manage guest bookings with automated data tracking.
- **Dashboard Overview**: Real-time stats on occupancy, reservations, and room availability.

## Tech Stack
- **Frontend**: Vanilla HTML5, CSS3, JavaScript (ES6+).
- **Backend**: Node.js, Express.
- **Database**: SQLite (via `better-sqlite3`).
- **Styling**: Pure CSS with CSS Variables.

## Setup
1. Standard Node.js environment required.
2. Default user provided: `admin` / `admin123`.
3. New staff can register as Attendants directly from the Signup page.

## Project Structure
- `/public`: Frontend assets (HTML, CSS, JS).
- `/server.js`: Express server and Database initialization.
- `/hotel.db`: SQLite database file (generated on first run).
