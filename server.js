import express from 'express';
import winston from 'winston';
import mysql from 'mysql2';
import cors from 'cors';

const app = express();
const PORT = 5000;
const HOST = '10.0.0.186';

// Middleware
app.use(cors()); // This should allow all CORS requests
app.use(express.json()); // Parse JSON requests

// Configure Winston logger
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: 'error.log', level: 'error' }), // Log errors to a file
    ],
});

// MySQL Connection
const db = mysql.createConnection({
    host: HOST,
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
    db.query('SELECT * FROM readings ORDER BY created_at DESC LIMIT 50', (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(results);
    });
});

app.get('/api/test', (req, res) => {
    res.send('Test route working');
});

// Error handling middleware
app.use((err, req, res, next) => {
    logger.error(err.stack); // Log the error stack
    res.status(500).send('Something broke!');
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on http://${HOST}:${PORT}`);
});
