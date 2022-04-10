const {
  config, conduit, log,
} = require('./node-common')(['config', 'conduit', 'log']);
const plugins = require('./modules/plugins');

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

/**
 * The main function.
 */
const main = async () => {
  log.begin();

  await conduit.register();
  await conduit.send({
    to: 'visuals',
    topic: 'setAll',
    message: { all: [0, 0, 0] },
  });

  plugins.loadAll();
};

main();
