const {
  log, config, attic,
} = require('./node-common')(['log', 'config', 'attic']);
const plugins = require('./modules/plugins');
const api = require('./modules/api');

/**
 * The main function.
 */
const main = async () => {
  log.begin({ appName: 'monitor' });
  attic.setAppName('monitor');

  await api.setup();

  plugins.loadAll();

  config.validate();
};

main();
