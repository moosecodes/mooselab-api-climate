import express from 'express';
import axios from 'axios';
import db from '../services/utils.js';

const router = express.Router();

router.get('/current', (req, res) => {
  db.query('SELECT * FROM expressdb.weather_readings ORDER BY created_at DESC LIMIT 1', (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

router.get('/recent', (req, res) => {
  db.query('SELECT * FROM expressdb.weather_readings ORDER BY created_at DESC LIMIT 10000', (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

const fetchWeatherData = async () => {
  console.log(new Date().toString());
  try {
    const response = await axios.get(
      `${process.env.OPENWEATHER_BASE_URL}?appid=${process.env.OPENWEATHER_API_KEY}&lat=${process.env.OPENWEATHER_LAT}&lon=${process.env.OPENWEATHER_LONG}&units=${process.env.OPENWEATHER_UNITS}`
    );

    const weatherData = response.data;
    const { temp, feels_like, temp_min, temp_max, humidity } = weatherData.main;
    const { main, description } = weatherData.weather[0];
    const { name } = weatherData;

    const insertQuery = `
      INSERT INTO expressdb.weather_readings 
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

fetchWeatherData();
setInterval(fetchWeatherData, process.env.WEATHER_FETCH_INTERVAL);

export default router;
