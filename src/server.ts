import { app } from './app.js';
import Logger from './utils/logger.js';

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  Logger.info(`server is running at port ${PORT}`);
});
