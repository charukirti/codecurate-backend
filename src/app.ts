import express from 'express';
import { ErrorHandler, notFoundHandler } from './middlewares/errorHandler.js';
import authRoutes from './modules/auth/auth.routes.js';
import cookieParser from 'cookie-parser';

const app = express();

app.use(express.json());
app.use(cookieParser());

app.get('/health', (req, res) => {
  res.json({ message: 'Welcome to codecurate backend!' });
});

app.use('/api/v1/auth', authRoutes);

app.use(notFoundHandler);

app.use(ErrorHandler);

export { app };
