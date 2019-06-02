const os = require('os');
const config = require('./config');
const log = require('./log');

const SUPPORTED_BOARDS = ['mote', 'blinkt'];

config.requireKeys('leds.js', {
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

log.assert(SUPPORTED_BOARDS.includes(config.LEDS.HARDWARE_TYPE), 'Valid hardware type', true);

const BLINK_TIME_MS = 100;
const NUM_LEDS = {
  mote: 16,
  blinkt: 8,
}[config.LEDS.HARDWARE_TYPE];

const pixelsState = [];
let blinkt = {};
let mote = {};
let initialised;
let blinkHandle = null;

const hardwareAvailable = () => {
  if (!os.arch().includes('arm') || !config.LEDS.USE_HARDWARE) {
    return false;
  }

  if (!initialised) {
    init();
  }

  return true;
};

const updateBlinkt = () => {
  blinkt.sendUpdate();
  blinkt.sendUpdate();
};

const init = () => {
  for (let i = 0; i < NUM_LEDS; i++) {
    pixelsState.push([0, 0, 0]);
  }

  if (config.LEDS.HARDWARE_TYPE === 'blinkt') {
    const NodeBlinkt = require('node-blinkt');
    blinkt = new NodeBlinkt();
    blinkt.setup();
    blinkt.setAllPixels(0, 0, 0, 1.0);
    updateBlinkt();
  } else if (config.LEDS.HARDWARE_TYPE === 'mote') {
    mote = require('./motePhat');
    mote.startServer();
  }

  initialised = true;
};

const setAll = async (nextRgb) => {
  for (let i = 0; i < NUM_LEDS; i++) {
    pixelsState[i] = nextRgb;
  }

  if (!hardwareAvailable()) {
    return;
  }

  if (config.LEDS.HARDWARE_TYPE === 'blinkt') {
    for (let i = 0; i < NUM_LEDS; i++) {
      set(i, nextRgb);
    }
  } else if (config.LEDS.HARDWARE_TYPE === 'mote') {
    // mote.setAll(nextRgb);

    // Server implementation is faster
    await mote.setAllServer(nextRgb);
  }
};

const set = (index, nextRgb) => {
  pixelsState[index] = nextRgb;

  if (!hardwareAvailable()) {
    return;
  }

  if (config.LEDS.HARDWARE_TYPE === 'blinkt') {
    const rgb = nextRgb.map(p => p * config.LEDS.ATTENUATION_FACTOR);
    blinkt.setPixel(index, ...rgb, config.LEDS.BRIGHTNESS);
    updateBlinkt();
  } else if (config.LEDS.HARDWARE_TYPE === 'mote') {
    mote.setPixels(pixelsState);
  }
};

const blink = (index, nextRgb) => {
  pixelsState[index] = nextRgb;

  if (!hardwareAvailable()) {
    return;
  }

  // Allow rapid requests to persist the blink, but not cancel it
  set(index, nextRgb);
  if (blinkHandle) {
    return;
  }

  blinkHandle = setTimeout(() => {
    set(index, [0, 0, 0]);
    blinkHandle = null;
  }, BLINK_TIME_MS);
};

module.exports = {
  set,
  setAll,
  blink,
  getState: () => pixelsState,
  getNumLEDs: () => NUM_LEDS,
};
