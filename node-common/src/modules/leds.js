const os = require('os');

const config = require('./config');
const log = require('./log');

const SUPPORTED_BOARDS = ['mote', 'blinkt'];

config.requireKeys('leds.js', {
  required: [ 'LEDS' ],
  type: 'object', properties: {
    LEDS: {
      required: [ 'ATTENUATION_FACTOR', 'BRIGHTNESS', 'USE_HARDWARE', 'HARDWARE_TYPE' ],
      type: 'object', properties: {
        ATTENUATION_FACTOR: { type: 'number', maximum: 1.0 },
        BRIGHTNESS: { type: 'number', maximum: 1.0 },
        USE_HARDWARE: { type: 'boolean' },
        HARDWARE_TYPE: { type: 'string', enum: SUPPORTED_BOARDS }
      }
    }
  }
});

log.assert(SUPPORTED_BOARDS.includes(config.LEDS.HARDWARE_TYPE), 'Valid hardware type', true);

const BLINK_TIME_MS = 100;
const NUM_LEDS = {
  mote: 16,
  blinkt: 8
}[config.LEDS.HARDWARE_TYPE];

let blinkt = {};
let mote = {};
const motePixels = [];
let initd;
let blinkHandle = null;

const allChecks = () => {
  if(!os.arch().includes('arm')) return false;
  if(!config.LEDS.USE_HARDWARE) return false;
  if(!initd) init();
  return true;
};

const update = () => {
  if(config.LEDS.HARDWARE_TYPE === 'blinkt') {
    blinkt.sendUpdate();
    blinkt.sendUpdate();
  } else if(config.LEDS.HARDWARE_TYPE === 'mote') {
    // Update is built into python script
  }
};
 
const init = () => {
  if(config.LEDS.HARDWARE_TYPE === 'blinkt') {
    const NodeBlinkt = require('node-blinkt');
    blinkt = new NodeBlinkt();
    blinkt.setup();
    blinkt.setAllPixels(0, 0, 0, 1.0);
    update();
  } else if(config.LEDS.HARDWARE_TYPE === 'mote') {
    mote = require('./motePhat');
    for(let i = 0; i < NUM_LEDS; i++) motePixels.push([0,0,0]);
    mote.setAll([0, 0, 0]);
  }

  initd = true;
};

const setAll = (rgbArr) => {
  if(!allChecks()) return;

  if(config.LEDS.HARDWARE_TYPE === 'blinkt') {
    for(let i = 0; i < NUM_LEDS; i++) set(i, rgbArr);
  } else if(config.LEDS.HARDWARE_TYPE === 'mote') {
    mote.setAll(rgbArr);
  }
};

const blink = (index, rgbArr) => {
  if(!allChecks()) return;
  
  set(index, rgbArr);

  if(blinkHandle !== null) return;
  blinkHandle = setTimeout(() => {
    blinkHandle = null;
    set(index, [0, 0, 0]);
  }, BLINK_TIME_MS);
};
 
const set = (index, rgbArr) => {
  if(!allChecks()) return;

  if(config.LEDS.HARDWARE_TYPE === 'blinkt') {
    blinkt.setPixel(index, 
                    rgbArr[0] * config.LEDS.ATTENUATION_FACTOR, 
                    rgbArr[1] * config.LEDS.ATTENUATION_FACTOR, 
                    rgbArr[2] * config.LEDS.ATTENUATION_FACTOR, 
                    config.LEDS.BRIGHTNESS);
    update();
  } else if(config.LEDS.HARDWARE_TYPE === 'mote') {
    motePixels[index] = rgbArr;
    mote.setPixels(motePixels);
  }
};

module.exports = { 
  set, setAll, blink, 
  getNumLEDs: () => NUM_LEDS 
};
