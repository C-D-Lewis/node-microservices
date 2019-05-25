const { execSync } = require('child_process');
const os = require('os');
const config = require('./config');
const log = require('./log');

const SUPPORTED_BOARDS = ['pioled'];
const PIOLED_LIB_PATH = `${__dirname}/../lib/pioled-text.py`;

config.requireKeys('textDisplay.js', {
  required: ['TEXT_DISPLAY'],
  properties: {
    TEXT_DISPLAY: {
      required: ['USE_HARDWARE', 'HARDWARE_TYPE'],
      properties: {
        USE_HARDWARE: { type: 'boolean' },
        HARDWARE_TYPE: { type: 'string', enum: SUPPORTED_BOARDS },
      },
    },
  },
});

log.assert(SUPPORTED_BOARDS.includes(config.TEXT_DISPLAY.HARDWARE_TYPE), 'Valid hardware type', true);

const NUM_LINES = {
  pioled: 4,
}[config.TEXT_DISPLAY.HARDWARE_TYPE];

const linesState = [];
let initialised;

const init = () => {
  for (let i = 0; i < NUM_LINES; i++) {
    linesState.push('');
  }

  if (config.TEXT_DISPLAY.HARDWARE_TYPE === 'pioled') {
    // No initialisation necessary
  }

  initialised = true;
};

const hardwareAvailable = () => {
  if (!os.arch().includes('arm') || !config.TEXT_DISPLAY.USE_HARDWARE) {
    return false;
  }

  if (!initialised) {
    init();
  }

  return true;
};

const setLine = (index, message) => {
  linesState[index] = message;
  if (!hardwareAvailable()) {
    return;
  }

  if (config.TEXT_DISPLAY.HARDWARE_TYPE === 'pioled') {
    let cmd = `python ${PIOLED_LIB_PATH}`;
    linesState.forEach((p) => {
      cmd += ` "${p}"`;
    });

    execSync(cmd);
  }
};

const setLines = (lines) => lines.forEach((p, i) => setLine(i, p));

const clearLines = () => {
  let cmd = `python ${PIOLED_LIB_PATH}`;
  for (let i = 0; i < NUM_LINES; i += 1) {
    cmd += ` ""`;
  }
  execSync(cmd);
}

module.exports = {
  setLine,
  setLines,
  clearLines,
  getLinesState: () => linesState,
  getNumLines: () => NUM_LINES,
};
