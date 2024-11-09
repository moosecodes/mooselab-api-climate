import express from 'express';
import axios from 'axios';
import db from '../services/utils.js';

const router = express.Router();

router.get('/current', (req, res) => {
  db.query('SELECT * FROM weather_data.local_readings ORDER BY created_at DESC LIMIT 1', (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

router.get('/recent', (req, res) => {
  db.query('SELECT * FROM weather_data.local_readings ORDER BY created_at DESC LIMIT 10000', (err, results) => {
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

setInterval(fetchWeatherData, process.env.WEATHER_FETCH_INTERVAL);

export default router;
