import express from 'express';
import pg from 'pg';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// Initialize Database
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

// Helper to check connection and run schema
async function initDb() {
  if (!process.env.DATABASE_URL) {
    console.warn('WARNING: DATABASE_URL is not defined in environment. The application will fail to perform database operations.');
    return;
  }

  try {
    const client = await pool.connect();
    console.log('Successfully connected to PostgreSQL');
    
    const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
    await client.query(schema);
    console.log('Database schema initialized');
    
    client.release();
  } catch (err) {
    console.error('Failed to initialize database:', err.message);
  }
}

initDb();

app.use(express.json());
app.use(express.static('public'));
app.use('/public', express.static('public'));

// Auth API
app.post('/api/signup', async (req, res) => {
  const { username, password } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO users (username, password, role) VALUES ($1, $2, $3) RETURNING id',
      [username, password, 'booker']
    );
    res.json({ success: true, userId: result.rows[0].id });
  } catch (err) {
    res.status(400).json({ error: 'Username already exists' });
  }
});

app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const result = await pool.query(
      'SELECT * FROM users WHERE username = $1 AND password = $2',
      [username, password]
    );
    const user = result.rows[0];
    if (user) {
      res.json({ success: true, user: { id: user.id, username: user.username, role: user.role } });
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin API
app.get('/api/users', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, username, role FROM users');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/users/role', async (req, res) => {
  const { userId, role } = req.body;
  try {
    await pool.query('UPDATE users SET role = $1 WHERE id = $2', [role, userId]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/users/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM users WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Rooms API
app.get('/api/rooms', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM rooms ORDER BY number ASC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/rooms', async (req, res) => {
  const { number, type, price } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO rooms (number, type, price) VALUES ($1, $2, $3) RETURNING id',
      [number, type, price]
    );
    res.json({ id: result.rows[0].id });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/rooms/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const activeRes = await pool.query('SELECT COUNT(*) as count FROM reservations WHERE room_id = $1', [id]);
    if (parseInt(activeRes.rows[0].count) > 0) {
      return res.status(400).json({ error: 'Cannot delete room with active reservations' });
    }
    await pool.query('DELETE FROM rooms WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/rooms/:id/reservations', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(`
      SELECT r.*, g.name as guest_name, g.email as guest_email
      FROM reservations r
      JOIN guests g ON r.guest_id = g.id
      WHERE r.room_id = $1
      ORDER BY r.check_in DESC
    `, [id]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Guests
app.get('/api/guests', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM guests');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Reservations
app.get('/api/reservations', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT r.*, rm.number as room_number, g.name as guest_name 
      FROM reservations r
      JOIN rooms rm ON r.room_id = rm.id
      JOIN guests g ON r.guest_id = g.id
      ORDER BY r.check_in DESC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/reservations', async (req, res) => {
  const { room_id, guest_name, guest_email, guest_phone, check_in, check_out } = req.body;
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // 1. Find or create guest
    let guestResult = await client.query('SELECT id FROM guests WHERE email = $1', [guest_email]);
    let guestId;
    
    if (guestResult.rows.length === 0) {
      const newGuest = await client.query(
        'INSERT INTO guests (name, email, phone) VALUES ($1, $2, $3) RETURNING id',
        [guest_name, guest_email, guest_phone]
      );
      guestId = newGuest.rows[0].id;
    } else {
      guestId = guestResult.rows[0].id;
    }
    
    // 2. Create reservation
    const resResult = await client.query(
      'INSERT INTO reservations (room_id, guest_id, check_in, check_out) VALUES ($1, $2, $3, $4) RETURNING id',
      [room_id, guestId, check_in, check_out]
    );
    
    await client.query('COMMIT');
    res.json({ id: resResult.rows[0].id });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(400).json({ error: err.message });
  } finally {
    client.release();
  }
});

app.delete('/api/reservations/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM reservations WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/reservations/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    await pool.query('UPDATE reservations SET status = $1 WHERE id = $2', [status, id]);
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/feedback', async (req, res) => {
  const { reservation_id, rating, comments } = req.body;
  try {
    await pool.query(
      'INSERT INTO feedback (reservation_id, rating, comments) VALUES ($1, $2, $3)',
      [reservation_id, rating, comments]
    );
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
