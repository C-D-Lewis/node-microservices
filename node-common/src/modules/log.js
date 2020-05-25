const fs = require('fs');
const config = require('./config');

config.requireKeys('log.js', {
  required: ['LOG'],
  properties: {
    LOG: {
      required: ['APP_NAME', 'LEVEL', 'TO_FILE'],
      properties: {
        APP_NAME: { type: 'string' },
        LEVEL: { type: 'string' },
        TO_FILE: { type: 'boolean' },
      },
    },
  },
});

const DECOR_WIDTH = 80; // process.stdout.columns;
const TAGS = {
  info: 'I',
  debug: 'D',
  error: 'E',
  fatal: 'F',
};

const getTimeString = () => {
  const str = new Date().toISOString();
  return str.substring(str.indexOf('T') + 1, str.indexOf('.'));
};

const writePid = () => fs.writeFileSync(`${config.getInstallPath()}/pid`, `${process.pid}`, 'utf8');

const writeToFile = (msg) => {
  const filePath = `${config.getInstallPath()}/${config.LOG.APP_NAME.split(' ').join('-')}.log`;

  let stream;
  if (!fs.existsSync(filePath)) {
    stream = fs.createWriteStream(filePath, { flags: 'w' });
    stream.end(`[${getTimeString()}] New log file!\n`);
  }

  stream = fs.createWriteStream(filePath, { flags: 'a' });
  stream.end(`${msg}\n`);
};

const log = (level, msg) => {
  // If the log level includes it, or its an important error
  if (!(config.LOG.LEVEL.includes(level) || ['error', 'fatal'].includes(level))) {
    return;
  }

  if (!assert(msg, `log 'msg' must not be undefined`, false)) {
    throw new Error('log \'msg\' was undefined');
  }

  if (typeof msg === 'object') {
    msg = msg.message || JSON.stringify(msg);
  }

  if (config.LOG.TO_FILE) {
    writeToFile(msg);
  }

  console.log(`[${TAGS[level]} ${getTimeString()} ${process.pid} ${config.LOG.APP_NAME}] ${msg}`);

  if (level === 'fatal') {
    // Oof
    process.exit(1);
  }
};

const assert = (condition, msg, strict) => {
  if (!condition) {
    msg = `Assertion failed: ${msg}`;
    const func = strict ? fatal : error;
    func(msg);
  }

  return condition;
};

const writeDecor = () => {
  const msg = ` ${config.LOG.APP_NAME} `;
  const decorLength = Math.floor((DECOR_WIDTH - msg.length) / 2);
  process.stdout.write('='.repeat(decorLength));
  process.stdout.write(msg);
  process.stdout.write('='.repeat(decorLength));
  process.stdout.write('\n');
};

const begin = () => {
  writeDecor();
  writePid();

  process.on('uncaughtException', (err) => {
    error('uncaughtException:');
    error(err.stack);
  });
  process.on('unhandledRejection', (err) => {
    error('unhandledRejection:');
    error(err.stack);
  });
};

const info = msg => log('info', msg);
const debug = msg => log('debug', msg);
const error = msg => log('error', msg);
const fatal = msg => log('fatal', msg);

module.exports = {
  begin,
  info,
  debug,
  error,
  fatal,
  assert,
};
