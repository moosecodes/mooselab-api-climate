const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors()); // This should allow all CORS requests
app.use(express.json()); // Parse JSON requests

// MySQL Connection
const db = mysql.createConnection({
    host: '127.0.0.1',
    user: 'rpidbuser',
    password: 'a',
    database: 'weather_data',
});

// Connect to MySQL
db.connect((err) => {
    if (err) {
        console.error('Database connection failed: ', err);
        return;
    }
    console.log('Connected to the database.');
});

// API endpoint to get data
app.get('/api/data', (req, res) => {
    db.query('SELECT * FROM readings ORDER BY created_at DESC LIMIT 1', (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(results);
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on http://127.0.0.1:${PORT}`);
});
