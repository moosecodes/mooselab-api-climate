import express from 'express';
import db from '../services/utils.js';

const router = express.Router();

router.get('/current', (req, res) => {
  db.query('SELECT * FROM weather_data.readings ORDER BY created_at DESC LIMIT 1', (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

router.get('/recent', (req, res) => {
  db.query('SELECT * FROM weather_data.readings ORDER BY created_at DESC LIMIT 10000', (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

router.get('/add', (req, res) => {
  // db.query(`INSERT INTO weather_data.readings (farenheit, clesius, humidity) VALUES(?, ?, ?)`)
  res.json({ message: "New climate data added" });
});

export default router;
