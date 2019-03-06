const { config, conduit, fcm, log } = require('./node-common')(['config', 'conduit', 'fcm', 'log']);
const plugins = require('./modules/plugins');
const statusLed = require('./modules/status-led');

config.requireKeys('main.js', {
  required: ['OPTIONS'],
  properties: {
    OPTIONS: {
      required: ['LED_STATES', 'DISPLAY_DRIVER'],
      properties: {
        LED_STATES: {
          required: ['OFF'],
          properties: {
            OFF: { type: 'array', items: { type: 'number' } },
          },
        },
        DISPLAY_DRIVER: {
          type: 'string',
          description: 'Name of corresponding node-common module',
          enum: ['textDisplay', 'leds'],
        },
      },
    },
  },
});

const main = async () => {
  log.begin();

  await conduit.register();
  await conduit.send({ to: 'LedServer', topic: 'setAll',
    message: { all: config.OPTIONS.LED_STATES.OFF },
  });
  statusLed.start();

  plugins.loadAll();

  fcm.post('Monitor', 'monitor', 'Monitor started successfully');
};

main();
