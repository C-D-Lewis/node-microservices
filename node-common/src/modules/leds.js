const os = require('os');
const config = require('./config');
const log = require('./log');

/** Supported HATs and other LED hardware */
const SUPPORTED_BOARDS = ['mote', 'blinkt'];

config.addPartialSchema({
  required: ['LEDS'],
  properties: {
    LEDS: {
      required: ['ATTENUATION_FACTOR', 'BRIGHTNESS', 'USE_HARDWARE', 'HARDWARE_TYPE'],
      properties: {
        ATTENUATION_FACTOR: { type: 'number', maximum: 1.0 },
        BRIGHTNESS: { type: 'number', maximum: 1.0 },
        USE_HARDWARE: { type: 'boolean' },
        HARDWARE_TYPE: { type: 'string', enum: SUPPORTED_BOARDS },
      },
    },
  },
});

const {
  LEDS: {
    ATTENUATION_FACTOR,
    BRIGHTNESS,
    USE_HARDWARE,
    HARDWARE_TYPE,
  },
} = config.get(['LEDS']);

log.assert(SUPPORTED_BOARDS.includes(HARDWARE_TYPE), 'Valid hardware type', true);

/** Time between blink on and off */
const BLINK_TIME_MS = 100;
/** Number of LEDs depending on configured hardware */
const NUM_LEDS = {
  mote: 16,
  blinkt: 8,
}[HARDWARE_TYPE];

const pixelsState = [];
let blinkt = {};
let mote = {};
let initialised;
let blinkHandle = null;

/**
 * Update blinkt - library somehow requires two of these.
 */
const updateBlinkt = () => {
  blinkt.sendUpdate();
  blinkt.sendUpdate();
};

/**
 * Init LED states and hardware library.
 */
const init = () => {
  for (let i = 0; i < NUM_LEDS; i += 1) {
    pixelsState.push([0, 0, 0]);
  }

  if (HARDWARE_TYPE === 'blinkt') {
    // eslint-disable-next-line import/no-unresolved
    const NodeBlinkt = require('node-blinkt');
    blinkt = new NodeBlinkt();
    blinkt.setup();
    blinkt.setAllPixels(0, 0, 0, 1.0);

    updateBlinkt();
  }

  if (HARDWARE_TYPE === 'mote') {
    mote = require('./motePhat');
  }

  initialised = true;
};

/**
 * Can LED hardware be used?
 *
 * @returns {boolean} true if hardware is available.
 */
const hardwareAvailable = () => {
  if (!os.arch().includes('arm') || !USE_HARDWARE) return false;
  if (!initialised) init();

  return true;
};

/**
 * Set a single LED to a new color.
 *
 * @param {number} index - LED index to change.
 * @param {Array<number>} nextRgb - RGB color values.
 */
const set = (index, nextRgb) => {
  pixelsState[index] = nextRgb;

  if (!hardwareAvailable()) return;

  if (HARDWARE_TYPE === 'blinkt') {
    const rgb = nextRgb.map((p) => p * ATTENUATION_FACTOR);
    blinkt.setPixel(index, ...rgb, BRIGHTNESS);
    updateBlinkt();
  }

  if (HARDWARE_TYPE === 'mote') {
    mote.setPixels(pixelsState);
  }
};

/**
 * Set all LEDs to a new color.
 *
 * @param {Array<number>} nextRgb - RGB color values.
 */
const setAll = async (nextRgb) => {
  for (let i = 0; i < NUM_LEDS; i += 1) {
    pixelsState[i] = nextRgb;
  }

  if (!hardwareAvailable()) return;

  if (HARDWARE_TYPE === 'blinkt') {
    for (let i = 0; i < NUM_LEDS; i += 1) set(i, nextRgb);
  }

  if (HARDWARE_TYPE === 'mote') {
    mote.setAll(nextRgb);
  }
};

/**
 * Blink a single LED.
 *
 * @param {number} index - LED index to change.
 * @param {Array<number>} nextRgb - RGB color values.
 */
const blink = (index, nextRgb) => {
  pixelsState[index] = nextRgb;

  if (!hardwareAvailable()) return;

  // Allow rapid requests to persist the blink, but not cancel it
  set(index, nextRgb);
  if (blinkHandle) return;

  blinkHandle = setTimeout(() => {
    set(index, [0, 0, 0]);
    blinkHandle = null;
  }, BLINK_TIME_MS);
};

/**
 * Fade all LEDs between two colors. Done in Python now for speed.
 *
 * @param {Array<number>} toRgb - To RGB color values.
 * @param {Array<number>} [fromRgb] - From RGB color values, if not current state
 */
const fadeAll = async (toRgb, fromRgb) => {
  // Set initial state immediately
  if (fromRgb && fromRgb.length === 3) {
    for (let i = 0; i < NUM_LEDS; i += 1) {
      pixelsState[i] = fromRgb;
    }
  }

  // No hardware, fade instantly in state for leds-simulator
  if (!hardwareAvailable()) {
    for (let i = 0; i < NUM_LEDS; i += 1) {
      pixelsState[i] = toRgb;
    }
    return;
  }

  if (HARDWARE_TYPE === 'blinkt') {
    throw new Error('Not implemented for blinkt currently');
  }

  if (HARDWARE_TYPE === 'mote') {
    // Go from the pixelsState currently unless fromRgb is set
    mote.fadeAll(toRgb, pixelsState[0]);

    // Fade complete, remember the end state
    for (let i = 0; i < NUM_LEDS; i += 1) {
      pixelsState[i] = toRgb;
    }
  }
};

// OK to init mote straight away - Non-pi dev should specify 'blinkt' HARDWARE_TYPE
if (HARDWARE_TYPE === 'mote') init();

module.exports = {
  set,
  setAll,
  blink,
  fadeAll,
  /**
   * Get pixels state.
   *
   * @returns {Array<object>} Pixels state.
   */
  getState: () => pixelsState,
  /**
   * Get number of LEDs.
   *
   * @returns {number} Number of LEDs available.
   */
  getNumLEDs: () => NUM_LEDS,
};
