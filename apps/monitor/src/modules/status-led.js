const {
  config, conduit
} = require('@chris-lewis/node-common')(['config', 'conduit']);

const sleep = require('./sleep');

config.requireKeys('main.js', {
  required: [ 'LED_STATES', 'STATUS_LED' ],
  type: 'object', properties: {
    LED_STATES: {
      required: [ 'OFF', 'STATUS' ],
      type: 'object', properties: {
        OFF: { type: 'array', items: { type: 'number' } },
        STATUS: { type: 'array', items: { type: 'number' } }
      }
    },
    STATUS_LED: { type: 'boolean' }
  }
});

const TOGGLE_INTERVAL_MS = 2000;
const LED_INDEX = 7;

const start = () => {
  if(!config.STATUS_LED) return;

  let state = false;
  setInterval(async () => {
    if(sleep.sleeping()) return;

    const rgb = state ? config.LED_STATES.OFF : config.LED_STATES.STATUS;
    state = !state;

    await conduit.send({
      to: 'LedServer', topic: 'setPixel',
      message: { [LED_INDEX]: rgb }
    });
  }, TOGGLE_INTERVAL_MS);
};

module.exports = { start };
