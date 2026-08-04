import express from 'express';

const app = express();

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    app.listen(PORT, () => console.log(`server started at ${PORT}`));
  } catch (error) {
    console.log(error);
  }
};

startServer();
