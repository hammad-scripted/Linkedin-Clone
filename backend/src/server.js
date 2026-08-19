import { config } from 'dotenv';
config();
import express from 'express';
import chalk from 'chalk';
import morgan from 'morgan';
import compression from 'compression';
import helmet from 'helmet';
import mongoose from 'mongoose';
import path from 'node:path';
import dns from 'node:dns/promises';
import { connectDb } from '../db/connectDb.js';
import { authRouter } from '../routes/auth.route.js';
import { userRouter } from '../routes/user.route.js';
import { postRouter } from '../routes/post.route.js';
import { notificationRouter } from '../routes/notifications.route.js';
import { connectionRouter } from '../routes/connections.route.js';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { getClientUrl } from '../lib/clientUrl.js';

const customDnsServers = (process.env.DNS_SERVERS || '')
  .split(',')
  .map((server) => server.trim())
  .filter(Boolean);

if (customDnsServers.length > 0) {
  dns.setServers(customDnsServers);
} else if (process.env.NODE_ENV !== 'production') {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
}

const app = express();

const PORT = process.env.PORT || 5000;
const isProduction = process.env.NODE_ENV === 'production';
const frontendDistPath = path.resolve(process.cwd(), 'frontend', 'dist');
const allowedOrigins = new Set([
  getClientUrl(),
  ...(process.env.CORS_ORIGINS || '')
    .split(',')
    .map((origin) => origin.trim().replace(/\/+$/, ''))
    .filter(Boolean),
]);

if (isProduction) app.set('trust proxy', 1);

//? Middlewares
app.disable('x-powered-by');
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        imgSrc: ["'self'", 'data:', 'https:'],
      },
    },
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  }),
);
app.use(compression());
app.use(express.json({ limit: '10mb' })); //* to parse json
app.use(express.urlencoded({ extended: true, limit: '10mb' })); //* to parse urlencoded
app.use(morgan(isProduction ? 'combined' : 'dev'));
app.use(cookieParser(process.env.JWT_SECRET));
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.has(origin.replace(/\/+$/, ''))) {
        return callback(null, true);
      }
      return callback(new Error('Origin is not allowed by CORS'));
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  }),
);

//? Routes
app.get('/api/health', (_req, res) => {
  const databaseConnected = mongoose.connection.readyState === 1;
  return res.status(databaseConnected ? 200 : 503).json({
    success: databaseConnected,
    status: databaseConnected ? 'ok' : 'database unavailable',
  });
});
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/posts', postRouter);
app.use('/api/v1/notifications', notificationRouter);
app.use('/api/v1/connections', connectionRouter);

app.use('/api', (_req, res) => {
  return res.status(404).json({ success: false, message: 'API route not found' });
});

if (isProduction) {
  app.use(
    express.static(frontendDistPath, {
      maxAge: '1d',
      setHeaders: (res, filePath) => {
        if (filePath.endsWith('index.html')) {
          res.setHeader('Cache-Control', 'no-cache');
        }
      },
    }),
  );
  app.get('/{*splat}', (_req, res) => {
    res.sendFile(path.join(frontendDistPath, 'index.html'));
  });
}

//? Error handler
app.use((err, req, res, next) => {
  void req;
  void next;
  console.error(err);
  const status = err.message === 'Origin is not allowed by CORS' ? 403 : 500;
  return res.status(status).json({
    success: false,
    message: isProduction && status === 500 ? 'Internal server error' : err.message,
  });
});

//? Server
const startServer = async () => {
  try {
    await connectDb();
    const server = app.listen(PORT, '0.0.0.0', () =>
      console.log(chalk.magenta.bold(`server started at ${PORT}`)),
    );

    const shutdown = (signal) => {
      console.log(`${signal} received; shutting down gracefully`);
      server.close(async () => {
        await mongoose.connection.close();
        process.exit(0);
      });
    };

    process.once('SIGTERM', () => shutdown('SIGTERM'));
    process.once('SIGINT', () => shutdown('SIGINT'));
  } catch (error) {
    console.error(chalk.red(error));
    process.exit(1);
  }
};

startServer();
