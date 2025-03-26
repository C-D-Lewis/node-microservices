const {
  log, conduit, config, attic,
} = require('./node-common')(['log', 'conduit', 'config', 'attic']);
const ipMonitor = require('./modules/ipMonitor');

/**
 * The main function.
 */
const main = async () => {
  log.begin({ appName: 'polaris' });
  attic.setAppName('polaris');

  await conduit.register({ appName: 'polaris' });

  ipMonitor.start();

  config.validate();
};

main();
