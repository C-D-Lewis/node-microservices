const { log, conduit, config } = require('./node-common')(['log', 'conduit', 'config']);
const ipMonitor = require('./modules/ipMonitor');

/**
 * The main function.
 */
const main = async () => {
  config.validate();

  log.begin();

  await conduit.register();

  ipMonitor.start();
};

main();
