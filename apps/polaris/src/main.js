const { log, conduit } = require('./node-common')(['log', 'conduit']);
const ipMonitor = require('./modules/ipMonitor');

/**
 * The main function.
 */
const main = async () => {
  log.begin();

  await conduit.register();

  // Setup ipMonitor
  ipMonitor.start();
};

main();
