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
      },
    },
  },
});

const LED_STATE_STATUS = [128, 128, 0];
const LED_STATE_OFF = [0, 0, 0];
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
      ? LED_STATE_OFF
      : LED_STATE_STATUS;
    state = !state;

    display.setLed(LED_INDEX, rgb);
  }, TOGGLE_INTERVAL_MS);
};

module.exports = {
  start,
};
