const fs = require('fs');
const config = require('./config');

config.requireKeys('log.js', {
  required: ['LOG'],
  properties: {
    LOG: {
      required: ['APP_NAME', 'LEVEL'],
      properties: {
        APP_NAME: { type: 'string' },
        LEVEL: { type: 'string' },
      },
    },
  },
});

/** Log start decor width */
const DECOR_WIDTH = 80; // process.stdout.columns;
/** Tag symbols */
const TAGS = {
  info: 'I',
  debug: 'D',
  error: 'E',
  fatal: 'F',
};
/** Time between log size evaluations */
const MONITOR_INTERVAL_MS = 60 * 60 * 1000;
/** Max log size */
const MAX_SIZE_MB = 50;
/** Log path */
const FILE_PATH = `${config.getInstallPath()}/${config.LOG.APP_NAME.split(' ').join('-')}.log`;

/**
 * Get a time string.
 *
 * @returns {string} Simple time string.
 */
const getTimeString = () => {
  const [date, time] = new Date().toISOString().split('T');
  const [finalTime] = time.split('.');
  return `${date} ${finalTime}`;
};

/**
 * Build log line prefix.
 *
 * @param {string} level - Log level.
 * @returns {string} Formatted log line prefix.
 */
const buildPrefix = (level) => `[${getTimeString()} ${process.pid} ${config.LOG.APP_NAME} ${TAGS[level]}]`;

/**
 * Write a log line to file.
 *
 * @param {string} msg - Message to write.
 */
const writeToFile = (msg) => {
  let stream;
  if (!fs.existsSync(FILE_PATH)) {
    stream = fs.createWriteStream(FILE_PATH, { flags: 'w' });
    stream.end(`${buildPrefix('info')} New log file!\n`);
  }

  stream = fs.createWriteStream(FILE_PATH, { flags: 'a' });
  stream.end(`${msg}\n`);
};

/**
 * Asset a condition, else log that it wasn't true.
 *
 * @param {boolean} condition - Condition statement to evaluate.
 * @param {string} msg - Message explaining the assert.
 * @param {boolean} strict - If a strict assertion, halt the app.
 * @returns {boolean} The condition outcome.
 */
const assert = (condition, msg, strict = false) => {
  if (!condition) {
    msg = `Assertion failed: ${msg}`;
    const func = strict ? fatal : error;
    func(msg);
  }

  return condition;
};

/**
 * Log a message.
 *
 * @param {string} level - Log level.
 * @param {string|object|Error} msg - Message to log.
 * @returns {undefined}
 */
const log = (level, msg) => {
  // If the log level includes it, or its an important error
  if (!(config.LOG.LEVEL.includes(level) || ['error', 'fatal'].includes(level))) return;

  // Message must be something
  if (!assert(msg, `log 'msg' must not be undefined`, false))
    throw new Error('log \'msg\' was undefined');

  // Handle Error or JSON object
  if (typeof msg === 'object') {
    msg = msg.message || JSON.stringify(msg);
  }

  // Write to all outputs
  const logLine = `${buildPrefix(level)} ${msg}`;
  writeToFile(logLine);
  console.log(logLine);

  // Fatal messages halt the app
  if (level === 'fatal') process.exit(1);
};

// Helper aliases
const info = msg => log('info', msg);
const debug = msg => log('debug', msg);
const error = msg => log('error', msg);
const fatal = msg => log('fatal', msg);

/**
 * Print fancy decor when app starts.
 */
const printDecor = () => {
  const msg = ` ${config.LOG.APP_NAME} `;
  const decorLength = Math.floor((DECOR_WIDTH - msg.length) / 2);
  process.stdout.write('='.repeat(decorLength));
  process.stdout.write(msg);
  process.stdout.write('='.repeat(decorLength));
  process.stdout.write('\n');
};

/**
 * Get logfile size in MB.
 *
 * @returns {number} Logfile size. 
 */
const getLogfileSizeMb = () => {
  try {
    const { size } = fs.statSync(FILE_PATH);
    return Math.round(size / (1024*1024));
  } catch (e) {}
};

/**
 * Monitor the log size, and erase if it gets too big.
 */
const monitorLogSize = () => {
  setInterval(() => {
    const sizeMb = getLogfileSizeMb();
    info(`Logfile size: ${sizeMb} MB`);

    if (sizeMb < MAX_SIZE_MB) return;

    // Erase the file and start again
    fs.unlinkSync(FILE_PATH);
    info('Log file exceeded max size and was restarted');
  }, MONITOR_INTERVAL_MS);
  info(`Monitoring logfile size (currently ${getLogfileSizeMb()} MB)`);
};

/**
 * Begin app logging, and handle uncaught errors.
 */
const begin = () => {
  printDecor();
  monitorLogSize();

  process.on('uncaughtException', (err) => {
    error('uncaughtException:');
    error(err.stack);
  });
  process.on('unhandledRejection', (err) => {
    error('unhandledRejection:');
    error(err.stack);
  });
};

module.exports = {
  begin,
  info,
  debug,
  error,
  fatal,
  assert,
};
