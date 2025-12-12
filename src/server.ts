import { app } from './app.js';
import appConfig from './config/app.config.js';
import Logger from './utils/logger.js';

const PORT = appConfig.port;

app.listen(PORT, () => {
  Logger.info(`server is running at port ${PORT}`);
});
