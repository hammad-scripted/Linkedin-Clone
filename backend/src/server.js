import { config } from 'dotenv';
config();
import dns from 'node:dns/promises';
dns.setServers(['8.8.8.8', '1.1.1.1']);
import express from 'express';
import chalk from 'chalk';
import morgan from 'morgan';
import { connectDb } from '../db/connectDb.js';
import { authRouter } from '../routes/auth.route.js';
const app = express();

const PORT = process.env.PORT || 5000;

//? Middlewares
app.use(express.json({ limit: '50mb' })); //* to parse json
app.use(express.urlencoded({ extended: true })); //* to parse urlencoded
app.use(morgan('dev'));

//? Routes
app.use('/api/v1/auth', authRouter);

//? Server
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
