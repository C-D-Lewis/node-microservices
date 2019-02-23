const {
  config
} = require('@chris-lewis/node-common')(['config']);
const display = require('./display');

config.requireKeys('sleep.js', {
  required: ['OPTIONS', 'LED_STATES'],
  properties: {
    OPTIONS: {
      required: ['SLEEP'],
      properties: {
        SLEEP: { type: 'boolean' },
      },
    },
    LED_STATES: {
      required: ['OFF'],
      properties: {
        OFF: { type: 'array', items: { type: 'number' } },
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

      display.setAllLeds(config.LED_STATES.OFF);
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
