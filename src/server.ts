import { app } from './app.js';
import appConfig from './config/app.config.js';
import Logger from './utils/logger.js';

const PORT = appConfig.port;

app.listen(PORT, () => {
  Logger.info(`Server running on port ${PORT}`);
  Logger.info(`Environment: ${appConfig.node_env}`);
  Logger.info(`Health check: http://localhost:${PORT}/health`);
});

process.on('SIGTERM', () => {
  Logger.info('SIGTERM signal received: closing HTTP server');
  process.exit(0);
});

process.on('SIGINT', () => {
  Logger.info('SIGINT signal received: closing HTTP server');
  process.exit(0);
});
