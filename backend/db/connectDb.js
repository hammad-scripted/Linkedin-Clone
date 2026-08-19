import mongoose from 'mongoose';
import chalk from 'chalk';

export const connectDb = async () => {
  const connection = await mongoose.connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 15000,
  });
  console.log(
    chalk.yellowBright.bold(`database connected ${connection.connection.host}`),
  );
  return connection;
};
