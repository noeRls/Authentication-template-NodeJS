const winston = require('winston');

const { createLogger, format, transports } = winston;

const maxsize = 10 * 1000 * 1000; // 10MB

const errorStackFormat = winston.format(info => {
  if (info instanceof Error) {
    return Object.assign({}, info, {
      stack: info.stack,
      message: info.message,
    });
  }
  return info;
});

const myFormatConsole = format.printf((item) => {
  const {
    level, message, timestamp, stack,
  } = item;
  let log = `${timestamp} [${level}]: ${message}`;
  if (stack) log += `\n${stack}`;
  return log;
});
const consoleFormat = format.combine(format.splat(),
  format.timestamp(), format.colorize(), format.prettyPrint(), myFormatConsole);

const fileFormat = format.combine(
  errorStackFormat(), format.splat(), format.timestamp(), format.prettyPrint(),
);

const transp = [
  new transports.File({
    filename: 'debug.log', level: 'debug', maxsize,
  }),
  new transports.File({
    filename: 'console.log', format: consoleFormat, level: 'debug', maxsize,
  }),
  new transports.File({
    filename: 'error.log', level: 'error', maxsize,
  }),
];
if (!process.env.TEST) transp.push(new transports.Console({ format: consoleFormat, level: 'silly' }));

// eslint-disable-next-line new-cap
const logger = createLogger({
  format: fileFormat,
  transports: transp,
});

logger.stream = {
  write: (msg) => {
    logger.info(msg);
  },
};

module.exports = logger;
