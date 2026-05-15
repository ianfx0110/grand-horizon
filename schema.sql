-- Grand Horizon Hotel & Resort Management System
-- MySQL Schema

CREATE DATABASE IF NOT EXISTS GrandHorizonHotel;
USE GrandHorizonHotel;

CREATE TABLE IF NOT EXISTS room_types (
    type_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    base_price DECIMAL(10, 2) NOT NULL,
    capacity INT NOT NULL,
    amenities TEXT -- JSON or comma separated string
);

CREATE TABLE IF NOT EXISTS rooms (
    room_number VARCHAR(20) PRIMARY KEY,
    type_id INT,
    floor INT,
    status ENUM('available', 'occupied', 'maintenance', 'out_of_order') DEFAULT 'available',
    img_url VARCHAR(255),
    FOREIGN KEY (type_id) REFERENCES room_types(type_id)
);

CREATE TABLE IF NOT EXISTS bookings (
    booking_id INT AUTO_INCREMENT PRIMARY KEY,
    room_number VARCHAR(20),
    client_name VARCHAR(100) NOT NULL,
    client_email VARCHAR(100) NOT NULL,
    client_phone VARCHAR(20),
    check_in DATE NOT NULL,
    check_out DATE NOT NULL,
    total_price DECIMAL(10, 2),
    status ENUM('confirmed', 'checked_in', 'checked_out', 'cancelled') DEFAULT 'confirmed',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (room_number) REFERENCES rooms(room_number)
);

CREATE TABLE IF NOT EXISTS inquiries (
    inquiry_id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100),
    subject VARCHAR(255),
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS admin_users (
    admin_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('admin', 'staff') DEFAULT 'staff',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Default admin user
INSERT IGNORE INTO admin_users(username, password_hash, role) 
VALUES ('ian', '$2b$10$ZDvqg98GZ2HnMEnyznQ3UuA4Z8R62jZgkxlNwfWXU5Jb1zIu9EUhW', 'admin');

-- Seed Room Types
INSERT IGNORE INTO room_types (name, description, base_price, capacity, amenities) VALUES
('Maasai Mara Executive Suite', 'A tribute to the majestic plains. Features hand-carved mahogany furniture, a private terrace overlooking the valley, and authentic Maasai textiles.', 18000.00, 2, 'High-Speed WiFi, Mini-bar, Valley View, Rain Shower, King Bed'),
('Lamu Coastal Sanctuary', 'Brings the serenity of the Indian Ocean inland. Swahili-inspired architecture with ivory accents and a spacious sunlit lounge.', 14500.00, 1, 'WiFi, Working Desk, AC, Luxury Bathtub, Queen Bed'),
('Great Rift Valley Presidential Wing', 'Peak luxury at the horizon. Includes two master bedrooms, private dining room with a dedicated chef, and a 360-degree observation deck.', 55000.00, 4, 'WiFi, Private Chef, 24/7 Butler, Private Pool, Observation Deck'),
('Amboseli Garden Villa', 'Tucked away in our botanical gardens. Features a private garden path and windows that frame the morning sun.', 12000.00, 2, 'WiFi, Private Garden, AC, Coffee Station');

-- Seed Rooms
INSERT IGNORE INTO rooms (room_number, type_id, floor, status) VALUES
('M101', 1, 1, 'available'),
('M102', 1, 1, 'available'),
('L201', 2, 2, 'available'),
('R301', 3, 3, 'available'),
('A001', 4, 0, 'available');
