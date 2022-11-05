const { execSync } = require('child_process');
const os = require('os');
const config = require('./config');

/** Supported OLED/text compatible boards */
const SUPPORTED_BOARDS = ['pioled', 'ssd1306'];
/** Path to supporting Python script */
const PIOLED_LIB_PATH = `${__dirname}/../lib/pioled-text.py`;
/** Path to supporting Python script */
const SSD1306_LIB_PATH = `${__dirname}/../lib/ssd1306.py`;

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

/** Maximum number of lines of text supported */
const NUM_LINES = {
  pioled: 4,
  ssd1306: 4,
}[config.TEXT_DISPLAY.HARDWARE_TYPE];

const linesState = [];
let initialised;

/**
 * Initialise module state and hardware.
 */
const init = () => {
  // Begin state
  for (let i = 0; i < NUM_LINES; i += 1) linesState.push('');

  // PiOLED
  if (config.TEXT_DISPLAY.HARDWARE_TYPE === 'pioled') {
    // No other initialisation necessary
  }

  // PiOLED
  if (config.TEXT_DISPLAY.HARDWARE_TYPE === 'ssd1306') {
    // No other initialisation necessary
  }

  // Other types...

  initialised = true;
};

/**
 * Test if hardware is available on this platform.
 *
 * @returns {boolean} true if the current platform is supported.
 */
const hardwareAvailable = () => {
  // Not Pi (ARM) or disabled
  if (!os.arch().includes('arm') || !config.TEXT_DISPLAY.USE_HARDWARE) return false;

  if (!initialised) init();
  return true;
};

/**
 * Set a given line of text.
 *
 * @param {number} index - Index of line to set.
 * @param {string} message - Line text content.
 */
const setLine = (index, message) => {
  linesState[index] = message;
  if (!hardwareAvailable()) return;

  // PiOLED
  if (config.TEXT_DISPLAY.HARDWARE_TYPE === 'pioled') {
    // Update all lines using state, including the new one
    let cmd = `python3 ${PIOLED_LIB_PATH}`;
    linesState.forEach((p) => {
      cmd += ` "${p}"`;
    });

    execSync(cmd);
    return;
  }

  if (config.TEXT_DISPLAY.HARDWARE_TYPE === 'ssd1306') {
    // Update all lines using state, including the new one
    let cmd = `python3 ${SSD1306_LIB_PATH}`;
    linesState.forEach((p) => {
      cmd += ` "${p}"`;
    });

    execSync(cmd);
    return;
  }

  // Other types...
  throw new Error('Unsupported hardware types');
};

/**
 * Set multiple lines at once, starting from the top line.
 *
 * @param {Array<string>} lines - Lines of text to set.
 * @returns {void}
 */
const setLines = (lines) => lines.forEach((p, i) => setLine(i, p));

/**
 * Clear all lines.
 *
 * @returns {void}
 */
const clearLines = () => setLines(' '.repeat(NUM_LINES).split(''));

module.exports = {
  setLine,
  setLines,
  clearLines,
  /**
   * Getter for linesState.
   *
   * @returns {Array<string>} linesState
   */
  getLinesState: () => linesState,
  /**
   * Getter for NUM_LINES.
   *
   * @returns {number} NUM_LINES
   */
  getNumLines: () => NUM_LINES,
};
