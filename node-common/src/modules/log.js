const fs = require('fs');
const config = require('./config');
require('colors');

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
const MAX_SIZE_MB = 1;
/** Log level color map */
const LEVEL_COLOR_MAP = {
  info: 'white',
  debug: 'gray',
  error: 'red',
  fatal: 'magenta',
};

let thisAppName = 'unknown';

/**
 * Get file path to log.
 *
 * @returns {string} Log file path.
 */
const getFilePath = () => `${config.getInstallPath()}/${thisAppName.split(' ').join('-')}.log`;

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
const buildPrefix = (level) => `[${getTimeString()} ${process.pid} ${thisAppName} ${TAGS[level]}]`;

/**
 * Write a log line to file.
 *
 * @param {string} msg - Message to write.
 */
const writeToFile = (msg) => {
  const filePath = getFilePath();

  let stream;
  if (!fs.existsSync(filePath)) {
    stream = fs.createWriteStream(filePath, { flags: 'w' });
    stream.end(`${buildPrefix('info')} New log file!\n`);
  }

  stream = fs.createWriteStream(filePath, { flags: 'a' });
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
    const finalMsg = `Assertion failed: ${msg}`;
    // eslint-disable-next-line no-use-before-define
    const func = strict ? fatal : error;
    func(finalMsg);
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
  // Message must be something
  if (!assert(msg, 'log \'msg\' must not be undefined', false)) { throw new Error('log \'msg\' was undefined'); }

  // Handle Error or JSON object
  let finalMsg = msg;
  if (typeof msg === 'object') {
    finalMsg = msg.message || JSON.stringify(msg);
  }

  // Write to all outputs
  const logLine = `${buildPrefix(level)} ${finalMsg}`;
  writeToFile(logLine);

  console.log(logLine[LEVEL_COLOR_MAP[level]]);

  // Fatal messages halt the app
  if (level === 'fatal') process.exit(1);
};

/**
 * Helper for info level.
 *
 * @param {*} msg - Log content.
 * @returns {void}
 */
const info = (msg) => log('info', msg);

/**
 * Helper for debug level.
 *
 * @param {*} msg - Log content.
 * @returns {void}
 */
const debug = (msg) => log('debug', msg);

/**
 * Helper for error level.
 *
 * @param {*} msg - Log content.
 * @returns {void}
 */
const error = (msg) => log('error', msg);

/**
 * Helper for fatal level.
 *
 * @param {*} msg - Log content.
 * @returns {void}
 */
const fatal = (msg) => log('fatal', msg);

/**
 * Print fancy decor when app starts.
 */
const printDecor = () => {
  const msg = ` ${thisAppName} `;
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
    const { size } = fs.statSync(getFilePath());
    return Math.round(size / (1024 * 1024));
  } catch (e) {
    return undefined;
  }
};

/**
 * Monitor the log size, and erase if it gets too big.
 */
const monitorLogSize = () => {
  const filePath = getFilePath();

  if (fs.existsSync(filePath)) {
    // Initally clear
    fs.unlinkSync(getFilePath());
  }

  setInterval(() => {
    const sizeMb = getLogfileSizeMb();
    info(`Logfile size: ${sizeMb} MB`);

    if (sizeMb < MAX_SIZE_MB) return;

    // Erase the file and start again
    fs.unlinkSync(filePath);
    info('Log file exceeded max size and was restarted');
  }, MONITOR_INTERVAL_MS);
  info(`Monitoring logfile size (currently ${getLogfileSizeMb()} MB)`);
};

/**
 * Begin app logging, and handle uncaught errors.
 *
 * @param {object} opts - Function opts.
 * @param {boolean} [opts.monitorLog] - Monitor log size.
 * @param {string} [opts.appName] - This app's name.
 */
const begin = ({ appName, monitorLog = true } = {}) => {
  thisAppName = appName;

  printDecor();

  if (monitorLog) monitorLogSize();

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
