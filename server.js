import expressListEndpoints from 'express-list-endpoints';
import express from 'express';
import dotenv from 'dotenv/config';
import winston from 'winston';
import cors from 'cors';
import bodyParser from 'body-parser';
import climateRoutes from './routes/climateRoutes.js';
import weatherRoutes from './routes/weatherRoutes.js';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.use('/api/climate', climateRoutes);
app.use('/api/weather', weatherRoutes);

// Print registered endpoints to console
console.log(expressListEndpoints(app));

// Configure Winston logger
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: 'error.log', level: 'error' }),
    ],
});

// Start server
app.listen(process.env.DB_SERVER_PORT, () => {
    console.log(`Server is running on http://${process.env.DB_HOST}:${process.env.DB_SERVER_PORT}`);
});
