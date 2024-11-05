import express from 'express';
import winston from 'winston';
import mysql from 'mysql2';
import cors from 'cors';
import bodyParser from 'body-parser';
import axios from 'axios';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Configure Winston logger
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: 'error.log', level: 'error' }),
    ],
});

// MySQL Connection
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
});

// Connect to MySQL
db.connect((err) => {
    if (err) {
        console.error('Database connection failed: ', err);
        return;
    }
    console.log('Connected to the database.');
});

// Function to fetch and store weather data
const fetchAndSaveWeatherData = async () => {
    try {
        const response = await axios.get(
            `https://api.openweathermap.org/data/2.5/weather?lat=${process.env.REACT_APP_OW_LAT}&lon=${process.env.REACT_APP_OW_LONG}&appid=${process.env.REACT_APP_OW_API_KEY}&units=${process.env.REACT_APP_OW_UNITS}`
        );

        const weatherData = response.data;
        const { temp, feels_like, temp_min, temp_max, humidity } = weatherData.main;
        const { main, description } = weatherData.weather[0];
        const { name, dt } = weatherData;

        const insertQuery = `
        INSERT INTO weather_data.local_readings 
        (farenheit, feels_like, temp_min, temp_max, humidity, name, conditions, description) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `;

        db.query(insertQuery, [temp, feels_like, temp_min, temp_max, humidity, name, main, description], (err, results) => {
            if (err) {
                console.error("Error inserting data:", err);
            } else {
                console.log("Weather data saved to database:", results);
            }
        });
    } catch (error) {
        console.error("Error fetching weather data:", error);
    }
};

// Call the function immediately on server start
fetchAndSaveWeatherData();

// Set an interval to call the function every 10 minutes (600000 ms)
setInterval(fetchAndSaveWeatherData, 600000);

// API endpoint to get data
app.get('/api/data/weather', (req, res) => {
    db.query('SELECT * FROM readings ORDER BY created_at DESC LIMIT 10000', (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(results);
    });
});

app.get('/api/data/weather/local', async (req, res) => {
    try {
        // Fetch the most recent 1000 entries in descending order
        const selectQuery = `
                SELECT * FROM weather_data.local_readings 
                ORDER BY created_at DESC 
                LIMIT 1000
            `;

        db.query(selectQuery, (err, results) => {
            if (err) {
                console.error("Error fetching recent data:", err);
                return res.status(500).json({ error: err.message });
            }

            // Send the response with the latest 1000 records
            res.json(results);
        });
    } catch (error) {
        console.error("Error fetching weather data:", error);
        res.status(500).json({ error: "Failed to fetch weather data" });
    }
});


// Error handling middleware
app.use((err, req, res, next) => {
    logger.error(err.stack);
    res.status(500).send('Something broke!');
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on http://${HOST}:${PORT}`);
});
