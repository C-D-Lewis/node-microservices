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

const pixelState = [];
let blinkt = {};
let mote = {};
let initd;
let blinkHandle = null;

const hardwareAvailable = () => {
  if (!os.arch().includes('arm') || !config.LEDS.USE_HARDWARE) {
    return false;
  }

  if (!initd) {
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
    pixelState.push([0, 0, 0]);
  }

  if (config.LEDS.HARDWARE_TYPE === 'blinkt') {
    const NodeBlinkt = require('node-blinkt');
    blinkt = new NodeBlinkt();
    blinkt.setup();
    blinkt.setAllPixels(0, 0, 0, 1.0);
    updateBlinkt();
  } else if (config.LEDS.HARDWARE_TYPE === 'mote') {
    mote = require('./motePhat');
    mote.setAll([0, 0, 0]);
  }

  initd = true;
};

const setAll = (rgbArr) => {
  for (let i = 0; i < NUM_LEDS; i++) {
    pixelState[i] = rgbArr;
  }

  if (!hardwareAvailable()) {
    return;
  }

  if (config.LEDS.HARDWARE_TYPE === 'blinkt') {
    for (let i = 0; i < NUM_LEDS; i++) {
      set(i, rgbArr);
    }
  } else if (config.LEDS.HARDWARE_TYPE === 'mote') {
    mote.setAll(rgbArr);
  }
};

const blink = (index, rgbArr) => {
  pixelState[index] = rgbArr;
  if (!hardwareAvailable()) {
    return;
  }

  set(index, rgbArr);

  if (blinkHandle) {
    return;
  }

  blinkHandle = setTimeout(() => {
    blinkHandle = null;

    set(index, [0, 0, 0]);
  }, BLINK_TIME_MS);
};

const set = (index, rgbArr) => {
  pixelState[index] = rgbArr;
  if (!hardwareAvailable()) {
    return;
  }

  if (config.LEDS.HARDWARE_TYPE === 'blinkt') {
    const rgb = rgbArr.map(p => p * config.LEDS.ATTENUATION_FACTOR);
    blinkt.setPixel(index, ...rgb, config.LEDS.BRIGHTNESS);
    updateBlinkt();
  } else if (config.LEDS.HARDWARE_TYPE === 'mote') {
    mote.setPixels(pixelState);
  }
};

module.exports = {
  set,
  setAll,
  blink,
  getState: () => pixelState,
  getNumLEDs: () => NUM_LEDS,
};
