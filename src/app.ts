import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authRoutes from './modules/auth/auth.routes.js';
import userRoutes from './modules/users/users.routes.js';
import resourceRoutes from './modules/resource/resource.routes.js';
import { tagsRouter } from './modules/reviews/reviews.routes.js';
import submissionsRoutes from './modules/submissions/submissions.routes.js';
import { ErrorHandler, notFoundHandler } from './middlewares/errorHandler.js';
import appConfig from './config/app.config.js';
import swaggerUi from 'swagger-ui-express';
import swaggerDoc from './swagger.json' with { type: 'json' };
import { globalRateLimiter } from './middlewares/rateLimiter.js';
import helmet from 'helmet';

const app = express();
app.set('trust proxy', 1);

app.use(helmet());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: (origin, callback) => {
      const allowedOrigins = appConfig.client_url
        .split(',')
        .map((url) => url.trim());

      if (appConfig.node_env === 'development' && !origin) {
        return callback(null, true);
      }

      if (!origin) {
        return callback(new Error('Origin not allowed'));
      }

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'PATCH', 'POST', 'DELETE', 'PUT'],
    credentials: true,
  })
);

app.use('/api/v1', globalRateLimiter);

app.get('/health', (req, res) => {
  res.json({
    message: 'Welcome to codecurate backend!',
    status: 'healthy',
    timestamp: new Date().toISOString(),
  });
});

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDoc));
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/resources', resourceRoutes);
app.use('/api/v1/reviews/tags', tagsRouter);
app.use('/api/v1/submissions', submissionsRoutes);

app.use(notFoundHandler);

app.use(ErrorHandler);

export { app };
