const { config } = require('../node-common')(['config']);
const display = require('./display');

config.requireKeys('sleep.js', {
  required: ['OPTIONS'],
  properties: {
    OPTIONS: {
      required: ['SLEEP'],
      properties: {
        SLEEP: { type: 'boolean' },
      },
    },
  },
});

const SLEEP_START_HOUR = 23;
const SLEEP_END_HOUR = 6;

let isSleeping = false;

const sleeping = () => {
  if (!config.OPTIONS.SLEEP) {
    return false;
  }

  const date = new Date();
  const hours = date.getHours();
  if (hours >= SLEEP_START_HOUR || hours < SLEEP_END_HOUR) {
    if (!isSleeping) {
      isSleeping = true;

      display.setAllLeds([0, 0, 0]);
    }

    return true;
  }

  if (isSleeping) {
    isSleeping = false;
  }

  return false;
};

module.exports = {
  sleeping,
};
