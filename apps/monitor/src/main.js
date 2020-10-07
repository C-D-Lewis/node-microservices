const { config, conduit, fcm, log } = require('./node-common')(['config', 'conduit', 'fcm', 'log']);
const plugins = require('./modules/plugins');
const statusLed = require('./modules/status-led');

config.requireKeys('main.js', {
  required: ['OPTIONS'],
  properties: {
    OPTIONS: {
      required: ['DISPLAY_DRIVER'],
      properties: {
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
  await conduit.send({ to: 'visuals', topic: 'setAll',
    message: { all: [0, 0, 0] },
  });
  statusLed.start();

  plugins.loadAll();

  fcm.post('Monitor', 'monitor', 'Monitor started successfully');
};

main();
