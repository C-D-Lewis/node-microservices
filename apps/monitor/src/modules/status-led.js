const {
  config
} = require('@chris-lewis/node-common')(['config']);
const display = require('./display');

const sleep = require('./sleep');

config.requireKeys('main.js', {
  required: ['LED_STATES', 'STATUS_LED'],
  properties: {
    LED_STATES: {
      required: ['OFF', 'STATUS'],
      properties: {
        OFF: { type: 'array', items: { type: 'number' } },
        STATUS: { type: 'array', items: { type: 'number' } },
      },
    },
    STATUS_LED: { type: 'boolean' },
  },
});

const TOGGLE_INTERVAL_MS = 2000;
const LED_INDEX = 7;

const start = () => {
  if (!config.STATUS_LED) {
    return;
  }

  let state = false;
  setInterval(async () => {
    if (sleep.sleeping()) {
      return;
    }

    const rgb = state ? config.LED_STATES.OFF : config.LED_STATES.STATUS;
    state = !state;

    display.setLed(LED_INDEX, rgb);
  }, TOGGLE_INTERVAL_MS);
};

module.exports = {
  start,
};
