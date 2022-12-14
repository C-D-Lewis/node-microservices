const { conduit, log } = require('./node-common')(['config', 'conduit', 'log']);
const plugins = require('./modules/plugins');
const api = require('./modules/api');

/**
 * The main function.
 */
const main = async () => {
  log.begin();

  await api.setup();

  // Clear any LEDs (still needed?)
  await conduit.send({
    to: 'visuals',
    topic: 'setAll',
    message: { all: [0, 0, 0] },
  });

  plugins.loadAll();
};

main();
