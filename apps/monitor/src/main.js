const {
  config, conduit, fcm, log
} = require('@chris-lewis/node-common')(['config', 'conduit', 'fcm', 'log']);

const plugins = require('./modules/plugins');
const statusLed = require('./modules/status-led');

config.requireKeys('main.js', {
  required: [ 'LED_STATES' ],
  type: 'object', properties: {
    LED_STATES: {
      required: [ 'OFF' ],
      type: 'object', properties: {
        OFF: { type: 'array', items: { type: 'number' } }
      }
    }
  }
});

(async () => {
  log.begin();

  await conduit.register();
  await conduit.send({ to: 'LedServer', topic: 'setAll', message: { all: config.LED_STATES.OFF } });
  statusLed.start();

  plugins.loadAll();

  fcm.post('Monitor', 'monitor', 'Monitor started successfully');
})();
