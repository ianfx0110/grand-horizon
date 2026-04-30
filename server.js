const express = require('express');
const mysql = require('mysql2');
const path = require('path');
const app = express();

// Set up for EJS and static files (not in original snippet but required for visual consistency)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const dbconnn = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '54321', // Use environment variables for production!
    database: 'Eldohub'
});

// Connecting to DB - added a log for visibility in AI Studio
dbconnn.connect((err) => {
    if (err) {
        console.error('MySQL connection error:', err.message);
        console.log('NOTE: MySQL is not automatically running in this container. Contact the administrator if connection fails.');
    } else {
        console.log('Connected to MySQL database: Eldohub');
    }
});

app.get('/', (req, res) => {
    res.redirect('/students');
});

app.get('/students', (req, res) => {
    dbconnn.query('SELECT * FROM students', (err, results) => {
        if (err) {
            console.error('Error fetching students:', err);
            // res.status(500).send('Error fetching students');
            // Mock data for display if DB fails in AI Studio
            res.render("students.ejs", { students: [] });
        } else {
            res.render("students.ejs", { students: results });
        }
    });
});

app.get("/newstudent", (req, res) => {
    res.render("newstudent.ejs");
});

app.post("/newstudent", (req, res) => {
    // insert new student into the database from a html form in to database
    console.log(req.body);
    const insertStatement = `INSERT INTO Students (student_id, fullname, email, password, phone_number) VALUES ( ${req.body.id}, '${req.body.fullname}', '${req.body.email}', '${req.body.password}', '${req.body.phone}')`

    dbconnn.query(insertStatement, (err) => {
        if (err) {
            res.status(500).send('Error inserting student' + err);
        } else {
            res.redirect("/students");
        }
    });
});

app.get("/courses", (req, res) => {
    dbconnn.query('SELECT * FROM Courses', (err, results) => {
        if (err) {
            console.error('Error fetching courses:', err);
            res.render("courses.ejs", { courses: [] });
        } else {
            res.render("courses.ejs", { courses: results });
        }
    });
});

app.get("/newcourse", (req, res) => {
    res.render("newcourse.ejs");
});

app.post("/newcourse", (req, res) => {
    // insert new course into the database from a html form in to database
    console.log(req.body);
    const insertStatement = `INSERT INTO Courses (course_id, course_name, course_description, lecturer, duration_in_months) VALUES ( ${req.body.id}, '${req.body.coursename}', '${req.body.description}', '${req.body.lecturer}', '${req.body.duration}')`

    dbconnn.query(insertStatement, (err) => {
        if (err) {
            res.status(500).send('Error inserting course' + err);
        } else {
            res.redirect("/courses");
        }
    });
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
