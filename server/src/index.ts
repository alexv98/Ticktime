import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import router from './router';
import errorMiddleware from './middlewares/error.middleware';

dotenv.config();

const app: express.Application = express();
const PORT: number = parseInt(process.env.PORT || '3000');

app.use(express.json());
app.use(cookieParser());
app.use(cors());
app.use('/api', router);
app.use(errorMiddleware);

app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});
