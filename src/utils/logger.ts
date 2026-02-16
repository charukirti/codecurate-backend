import winston, { Logform } from 'winston';

const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

const level = () => {
  const env = process.env.NODE_ENV || 'development';
  const isDevelopment = env === 'development';
  return isDevelopment ? 'debug' : 'http';
};

const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

winston.addColors(colors);

const isDevelopment = process.env.NODE_ENV === 'development';

const devFormat = winston.format.combine(
  winston.format.timestamp({ format: 'DD-MM-YYYY hh:mm:ss A' }),
  winston.format.colorize({ all: true }),
  winston.format.errors({ stack: true }),
  winston.format.printf((info: Logform.TransformableInfo) => {
    let log = `${info.timestamp} ${info.level}: ${info.message}`;

    if (info.stack) {
      log += `\n${info.stack}`;
    }

    return log;
  })
);

const prodFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

const transports = [
  new winston.transports.Console({
    handleExceptions: true,
    handleRejections: true,
  }),
];

const Logger = winston.createLogger({
  level: level(),
  levels,
  format: isDevelopment ? devFormat : prodFormat,
  transports,
  exitOnError: false,
});

export default Logger;
