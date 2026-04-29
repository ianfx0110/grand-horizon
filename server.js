import express from 'express';
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// Initialize Database
const db = new Database('hotel.db');

// Execute schema and seed data
const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
db.exec(schema);

app.use(express.json());
app.use(express.static('public'));

// Auth API
app.post('/api/signup', (req, res) => {
  const { username, password } = req.body;
  try {
    // Default signup is 'booker'
    const info = db.prepare('INSERT INTO users (username, password, role) VALUES (?, ?, ?)').run(username, password, 'booker');
    res.json({ success: true, userId: info.lastInsertRowid });
  } catch (err) {
    res.status(400).json({ error: 'Username already exists' });
  }
});

app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  const user = db.prepare('SELECT * FROM users WHERE username = ? AND password = ?').get(username, password);
  if (user) {
    res.json({ success: true, user: { id: user.id, username: user.username, role: user.role } });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

// Admin API
app.get('/api/users', (req, res) => {
  // In a real app, you'd check for admin role via token/session
  const users = db.prepare('SELECT id, username, role FROM users').all();
  res.json(users);
});

app.post('/api/users/role', (req, res) => {
  const { userId, role } = req.body;
  db.prepare('UPDATE users SET role = ? WHERE id = ?').run(role, userId);
  res.json({ success: true });
});

app.delete('/api/users/:id', (req, res) => {
  const { id } = req.params;
  db.prepare('DELETE FROM users WHERE id = ?').run(id);
  res.json({ success: true });
});

// Rooms API
app.get('/api/rooms', (req, res) => {
  const rooms = db.prepare('SELECT * FROM rooms').all();
  res.json(rooms);
});

app.post('/api/rooms', (req, res) => {
  const { number, type, price } = req.body;
  try {
    const info = db.prepare('INSERT INTO rooms (number, type, price) VALUES (?, ?, ?)').run(number, type, price);
    res.json({ id: info.lastInsertRowid });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/rooms/:id', (req, res) => {
  const { id } = req.params;
  try {
    // Check if there are active reservations first
    const activeRes = db.prepare('SELECT COUNT(*) as count FROM reservations WHERE room_id = ?').get(id);
    if (activeRes.count > 0) {
      return res.status(400).json({ error: 'Cannot delete room with active reservations' });
    }
    db.prepare('DELETE FROM rooms WHERE id = ?').run(id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/rooms/:id/reservations', (req, res) => {
  const { id } = req.params;
  const reservations = db.prepare(`
    SELECT r.*, g.name as guest_name, g.email as guest_email
    FROM reservations r
    JOIN guests g ON r.guest_id = g.id
    WHERE r.room_id = ?
    ORDER BY r.check_in DESC
  `).all(id);
  res.json(reservations);
});

// Guests
app.get('/api/guests', (req, res) => {
  const guests = db.prepare('SELECT * FROM guests').all();
  res.json(guests);
});

// Reservations
app.get('/api/reservations', (req, res) => {
  const reservations = db.prepare(`
    SELECT r.*, rm.number as room_number, g.name as guest_name 
    FROM reservations r
    JOIN rooms rm ON r.room_id = rm.id
    JOIN guests g ON r.guest_id = g.id
  `).all();
  res.json(reservations);
});

app.post('/api/reservations', (req, res) => {
  const { room_id, guest_name, guest_email, guest_phone, check_in, check_out } = req.body;
  
  try {
    const transaction = db.transaction(() => {
      // 1. Find or create guest
      let guest = db.prepare('SELECT id FROM guests WHERE email = ?').get(guest_email);
      if (!guest) {
        const info = db.prepare('INSERT INTO guests (name, email, phone) VALUES (?, ?, ?)').run(guest_name, guest_email, guest_phone);
        guest = { id: info.lastInsertRowid };
      }
      
      // 2. Create reservation
      const resInfo = db.prepare('INSERT INTO reservations (room_id, guest_id, check_in, check_out) VALUES (?, ?, ?, ?)')
        .run(room_id, guest.id, check_in, check_out);
      
      // 3. Update room status (optional, maybe only on check-in)
      // db.prepare('UPDATE rooms SET status = "occupied" WHERE id = ?').run(room_id);
      
      return resInfo.lastInsertRowid;
    });
    
    const reservationId = transaction();
    res.json({ id: reservationId });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/reservations/:id', (req, res) => {
  const { id } = req.params;
  db.prepare('DELETE FROM reservations WHERE id = ?').run(id);
  res.json({ success: true });
});

app.patch('/api/reservations/:id/status', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    db.prepare('UPDATE reservations SET status = ? WHERE id = ?').run(status, id);
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/feedback', (req, res) => {
  const { reservation_id, rating, comments } = req.body;
  try {
    db.prepare('INSERT INTO feedback (reservation_id, rating, comments) VALUES (?, ?, ?)').run(reservation_id, rating, comments);
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Serve HTML files
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/login.html'));
});

app.get('/signup', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/signup.html'));
});

app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/dashboard.html'));
});

app.get('/rooms', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/rooms.html'));
});

app.get('/reservations', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/reservations.html'));
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/admin.html'));
});

app.get('/settings', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/settings.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
