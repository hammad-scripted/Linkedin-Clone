import { config } from 'dotenv';
config();
import dns from 'node:dns/promises';
dns.setServers(['8.8.8.8', '1.1.1.1']);
import express from 'express';
import chalk from 'chalk';
import morgan from 'morgan';
import { connectDb } from '../db/connectDb.js';
const app = express();

const PORT = process.env.PORT || 5000;



//? Middlewares
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
const startServer = async () => {
  try {
    await connectDb();
    app.listen(PORT, () =>
      console.log(chalk.magenta.bold(`server started at ${PORT}...`)),
    );
  } catch (error) {
    console.log(chalk.red(error));
  }
};

startServer();
