-- Grand Horizon Hotel Management System
-- Schema & Kenyan Heritage Seed Data

-- Users Table (Staff & Admins)
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'staff' -- 'admin', 'staff', 'booker'
);

-- Rooms Table
CREATE TABLE IF NOT EXISTS rooms (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    number TEXT UNIQUE NOT NULL,
    type TEXT NOT NULL,
    price REAL NOT NULL,
    status TEXT DEFAULT 'available' -- 'available', 'occupied', 'maintenance'
);

-- Guests Table
CREATE TABLE IF NOT EXISTS guests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT
);

-- Reservations Table
CREATE TABLE IF NOT EXISTS reservations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    room_id INTEGER NOT NULL,
    guest_id INTEGER NOT NULL,
    check_in DATE NOT NULL,
    check_out DATE NOT NULL,
    status TEXT DEFAULT 'confirmed', -- 'confirmed', 'cancelled', 'completed'
    FOREIGN KEY (room_id) REFERENCES rooms(id),
    FOREIGN KEY (guest_id) REFERENCES guests(id)
);

-- Feedback Table
CREATE TABLE IF NOT EXISTS feedback (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    reservation_id INTEGER NOT NULL,
    rating INTEGER NOT NULL,
    comments TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (reservation_id) REFERENCES reservations(id)
);

-- SEED DATA
-- Default Identities
INSERT OR IGNORE INTO users (username, password, role) VALUES 
('admin', 'admin123', 'admin'),
('mwangi_staff', 'staff123', 'staff'),
('akinyi_staff', 'staff123', 'staff');

-- Accommodation Portfolio (Kenyan Themed)
INSERT OR IGNORE INTO rooms (number, type, price, status) VALUES 
('101', 'Single', 120, 'available'),
('102', 'Double', 200, 'occupied'),
('103', 'Double', 200, 'available'),
('201', 'Suite', 450, 'available'),
('202', 'Suite', 450, 'occupied'),
('203', 'Deluxe', 350, 'available'),
('301', 'Penthouse', 1200, 'available'), -- Rift Valley Presidential Suite
('302', 'Deluxe', 350, 'maintenance'),
('401', 'Single', 120, 'available'),
('402', 'Double', 200, 'available');

-- Guest Manifest (Authentic Kenyan Identities)
INSERT OR IGNORE INTO guests (name, email, phone) VALUES 
('Jomo Mwangi', 'jomo.m@horizon.ke', '+254 712 345678'),
('Amani Otieno', 'amani.o@horizon.ke', '+254 722 345678'),
('Faith Wanjiku', 'faith.w@horizon.ke', '+254 733 345678'),
('David Kamau', 'david.k@horizon.ke', '+254 744 345678'),
('Sarah Onyango', 'sarah.o@horizon.ke', '+254 755 345678'),
('Joseph Njeri', 'joseph.n@horizon.ke', '+254 766 345678'),
('Eliud Kipchoge', 'eliud.k@horizon.ke', '+254 777 345678'),
('Mercy Mutua', 'mercy.m@horizon.ke', '+254 788 345678'),
('Beatrice Adhiambo', 'beatrice.a@horizon.ke', '+254 799 345678'),
('Ali Hassan', 'ali.h@horizon.ke', '+254 700 345678');

-- Historical Log (Seed Reservations)
INSERT OR IGNORE INTO reservations (id, room_id, guest_id, check_in, check_out, status) VALUES 
(1, 1, 1, '2026-05-01', '2026-05-05', 'confirmed'),
(2, 2, 2, '2026-04-28', '2026-05-02', 'confirmed'),
(3, 3, 3, '2026-05-10', '2026-05-15', 'confirmed'),
(4, 4, 4, '2026-05-12', '2026-05-18', 'confirmed'),
(5, 5, 5, '2026-04-25', '2026-04-30', 'completed');
