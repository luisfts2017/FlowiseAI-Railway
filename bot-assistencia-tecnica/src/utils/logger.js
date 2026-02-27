const fs = require('node:fs');
const path = require('node:path');
const { createLogger, format, transports } = require('winston');

const pastaLogs = path.resolve(process.cwd(), 'logs');
if (!fs.existsSync(pastaLogs)) {
  fs.mkdirSync(pastaLogs, { recursive: true });
}

const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.printf(({ level, message, timestamp }) => `[${timestamp}] ${level.toUpperCase()} ${message}`)
  ),
  transports: [
    new transports.Console(),
    new transports.File({ filename: path.join(pastaLogs, 'bot.log') })
  ]
});

module.exports = { logger };
