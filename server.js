const express = require('express');
const mysql = require('mysql2');
const app = express();
const dbconnn = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '54321',
    database: 'GrandHorizon'
});
