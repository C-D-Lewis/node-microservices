const { config } = require('../node-common')(['config']);
const display = require('./display');
const sleep = require('./sleep');

config.requireKeys('main.js', {
  required: ['OPTIONS'],
  properties: {
    OPTIONS: {
      required: ['STATUS_LED'],
      properties: {
        STATUS_LED: { type: 'boolean' },
        LED_STATES: {
          required: ['OFF', 'STATUS'],
          properties: {
            OFF: { type: 'array', items: { type: 'number' } },
            STATUS: { type: 'array', items: { type: 'number' } },
          },
        },
      },
    },
  },
});

const TOGGLE_INTERVAL_MS = 2000;
const LED_INDEX = 7;

const start = () => {
  if (!config.OPTIONS.STATUS_LED) {
    return;
  }

  let state = false;
  setInterval(async () => {
    if (sleep.sleeping()) {
      return;
    }

    const rgb = state
      ? config.OPTIONS.LED_STATES.OFF
      : config.OPTIONS.LED_STATES.STATUS;
    state = !state;

    display.setLed(LED_INDEX, rgb);
  }, TOGGLE_INTERVAL_MS);
};

module.exports = {
  start,
};
