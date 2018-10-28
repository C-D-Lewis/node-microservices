const {
  config, conduit
} = require('@chris-lewis/node-common')(['config', 'conduit']);

config.requireKeys('sleep.js', {
  required: [ 'SLEEP', 'LED_STATES' ],
  type: 'object', properties: {
    SLEEP: { type: 'boolean' },
    LED_STATES: {
      required: [ 'OFF' ],
      type: 'object', properties: {
        OFF: { type: 'array', items: { type: 'number' } }
      }
    }
  }
});

const SLEEP_START_HOUR = 23;
const SLEEP_END_HOUR = 6;

let isSleeping = false;

const sleeping = () => {
  if(!config.SLEEP) return false;

  const date = new Date();
  const hours = date.getHours();
  if(hours >= SLEEP_START_HOUR || hours < SLEEP_END_HOUR) {
    if(!isSleeping) {
      isSleeping = true;

      conduit.send({
        to: 'LedServer', topic: 'setAll',
        message: { all: config.LED_STATES.OFF }
      });
    }

    return true;
  }

  if(isSleeping) isSleeping = false;
  return false;
};

module.exports = { sleeping };
