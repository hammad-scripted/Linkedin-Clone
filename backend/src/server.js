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
import cookieParser from 'cookie-parser';
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

//? Routes
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/users',userRouter)
app.use('/api/v1/posts',postRouter);

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
