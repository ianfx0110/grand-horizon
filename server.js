const express = require("express");
const session = require("express-session");
const bcrypt = require("bcrypt");
const path = require("path");
const mysql = require("mysql2");

const app = express();
const PORT = 3000;

const dbConn = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "54321",
  database: "GrandHorizonHotel",
});

dbConn.connect((err) => {
  if (err) {
    console.error("Database connection failed:", err.stack);
    return;
  }
  console.log("Connected to GrandHorizonHotel database.");
});

app.use(
  session({
    secret: "grand-horizon-hotel-secret-54321",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, maxAge: 1000 * 60 * 60 * 24 },
  })
);

app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Auth Middleware
const isAuth = (req, res, next) => {
  if (req.session && req.session.user) {
    next();
  } else {
    res.status(401).json({ error: "Unauthorized" });
  }
};

const isSuperAdmin = (req, res, next) => {
  if (req.session && req.session.user && req.session.role === 'admin') {
    next();
  } else {
    res.status(403).json({ error: "Forbidden: Admins only" });
  }
};

// --- API ROUTES ---

// Public Room Routes
app.get("/rooms", (req, res) => {
  const q = `
    SELECT r.*, rt.name as type_name, rt.description, rt.base_price, rt.capacity, rt.amenities
    FROM rooms r
    JOIN room_types rt ON r.type_id = rt.type_id
    WHERE r.status = 'available'
  `;
  dbConn.query(q, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

app.post("/bookings", (req, res) => {
  const { room_number, client_name, client_email, client_phone, check_in, check_out, total_price } = req.body;
  const q = `INSERT INTO bookings (room_number, client_name, client_email, client_phone, check_in, check_out, total_price) VALUES (?, ?, ?, ?, ?, ?, ?)`;
  dbConn.query(q, [room_number, client_name, client_email, client_phone, check_in, check_out, total_price], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    
    // Update room status
    dbConn.query("UPDATE rooms SET status = 'occupied' WHERE room_number = ?", [room_number]);
    
    res.status(201).json({ message: "Booking confirmed", booking_id: results.insertId });
  });
});

app.post("/login", (req, res) => {
  const { username, password } = req.body;
  dbConn.query(
    "SELECT * FROM admin_users WHERE username = ?",
    [username],
    (err, results) => {
      if (err) return res.status(500).json({ error: "Database error" });
      if (results.length === 0) return res.status(401).json({ error: "Invalid credentials" });

      const user = results[0];
      if (bcrypt.compareSync(password, user.password_hash)) {
        req.session.user = { id: user.admin_id, username: user.username };
        req.session.role = user.role;
        res.json({ message: "Login successful", user: req.session.user, role: user.role });
      } else {
        res.status(401).json({ error: "Invalid credentials" });
      }
    }
  );
});

app.post("/logout", (req, res) => {
  req.session.destroy();
  res.json({ message: "Logged out" });
});

app.get("/me", (req, res) => {
  if (req.session.user) {
    res.json({ user: req.session.user, role: req.session.role });
  } else {
    res.status(401).json({ error: "Not logged in" });
  }
});

// Admin/Staff Protected Routes
app.get("/admin/bookings", isAuth, (req, res) => {
  const q = `
    SELECT b.*, rt.name as room_type
    FROM bookings b
    JOIN rooms r ON b.room_number = r.room_number
    JOIN room_types rt ON r.type_id = rt.type_id
    ORDER BY b.created_at DESC
  `;
  dbConn.query(q, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

app.get("/admin/rooms", isAuth, (req, res) => {
  const q = `
    SELECT r.*, rt.name as type_name, rt.base_price
    FROM rooms r
    JOIN room_types rt ON r.type_id = rt.type_id
  `;
  dbConn.query(q, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

app.post("/admin/rooms", isAuth, (req, res) => {
  const { room_number, type_id, floor } = req.body;
  const q = "INSERT INTO rooms (room_number, type_id, floor) VALUES (?, ?, ?)";
  dbConn.query(q, [room_number, type_id, floor], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ message: "Room added" });
  });
});

app.get("/admin/room-types", isAuth, (req, res) => {
    dbConn.query("SELECT * FROM room_types", (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// User Management (SuperAdmin Only)
app.post("/admin/users", isSuperAdmin, async (req, res) => {
  const { username, password, role } = req.body;
  if (!username || !password || !role) return res.status(400).json({ error: "Missing fields" });
  
  try {
    const hash = await bcrypt.hash(password, 10);
    dbConn.query(
      "INSERT INTO admin_users (username, password_hash, role) VALUES (?, ?, ?)",
      [username, hash, role],
      (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ message: "User created successfully" });
      }
    );
  } catch (err) {
    res.status(500).json({ error: "Hash failed" });
  }
});

// Inquiry API
app.post("/inquiries", (req, res) => {
    const { full_name, email, subject, message } = req.body;
    dbConn.query("INSERT INTO inquiries (full_name, email, subject, message) VALUES (?, ?, ?, ?)", 
    [full_name, email, subject, message], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ message: "Inquiry received", inquiry_id: results.insertId });
    });
});

// Handle SPA-like routing: serve index.html for all non-API routes
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => {
  console.log(`Grand Horizon Hotel server running on port ${PORT}`);
});
