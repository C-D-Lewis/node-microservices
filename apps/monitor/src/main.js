const { conduit, log, config } = require('./node-common')(['conduit', 'log', 'config']);
const plugins = require('./modules/plugins');
const api = require('./modules/api');

/**
 * The main function.
 */
const main = async () => {
  log.begin({ appName: 'monitor' });

  await api.setup();

  // Clear any LEDs (still needed?)
  await conduit.send({
    to: 'visuals',
    topic: 'setAll',
    message: { all: [0, 0, 0] },
  });

  plugins.loadAll();

  config.validate();
};

main();
