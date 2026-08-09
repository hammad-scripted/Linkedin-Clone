import { config } from 'dotenv';
config();
import dns from 'node:dns/promises';
dns.setServers(['8.8.8.8', '1.1.1.1']);
import express from 'express';
import chalk from 'chalk';
import morgan from 'morgan';
import { connectDb } from '../db/connectDb.js';
import { authRouter } from '../routes/auth.route.js';
import { userRouter } from '../routes/user.route.js';
import { postRouter } from '../routes/post.route.js';
import { notificationRouter } from '../routes/notifications.route.js';
import { connectionRouter } from '../routes/connections.route.js';
import cookieParser from 'cookie-parser';
import cors from 'cors';
const app = express();

const PORT = process.env.PORT || 5000;

//? Middlewares
app.use(express.json({ limit: '50mb' })); //* to parse json
app.use(express.urlencoded({ extended: true })); //* to parse urlencoded
app.use(morgan('dev'));
app.use(
  cookieParser(process.env.JWT_SECRET, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 24 * 60 * 60 * 1000,
  }),
);
app.use(
  cors({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  }),
);

//? Routes
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/posts', postRouter);
app.use('/api/v1/notifications', notificationRouter);
app.use('/api/v1/connections', connectionRouter);

//? Error handler
app.use((err, req, res, next) => {
  console.log(err);
  return res.status(500).json({ success: false, message: err.message });
});

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
