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

let linesState = ''.repeat(NUM_LINES);

/**
 * Test if hardware is available on this platform.
 *
 * @returns {boolean} true if the current platform is supported.
 */
const hardwareAvailable = () => (os.arch().includes('arm') && config.TEXT_DISPLAY.USE_HARDWARE);

/**
 * Set a given line of text.
 *
 * @param {Array<string>} lines - Lines of text to set.
 */
const setLines = (lines) => {
  linesState = [...lines];

  // Fill to expected number
  while (linesState.length < NUM_LINES) linesState.push('');
  if (!hardwareAvailable()) return;

  // PiOLED
  if (config.TEXT_DISPLAY.HARDWARE_TYPE === 'pioled') {
    execSync(`python3 ${PIOLED_LIB_PATH} ${linesState.map((p) => `"${p}"`).join(' ')}`);
    return;
  }

  // SSD1306 module
  if (config.TEXT_DISPLAY.HARDWARE_TYPE === 'ssd1306') {
    execSync(`python3 ${SSD1306_LIB_PATH} ${linesState.map((p) => `"${p}"`).join(' ')}`);
    return;
  }

  // Other types...
  throw new Error('Unsupported hardware types');
};

/**
 * Clear all lines.
 *
 * @returns {void}
 */
const clearLines = () => setLines(' '.repeat(NUM_LINES).split(''));

module.exports = {
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
