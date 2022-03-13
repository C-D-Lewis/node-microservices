const { log } = require('./node-common')(['log']);
const ipMonitor = require('./modules/ipMonitor');

/**
 * The main function.
 */
const main = () => {
  log.begin();

  // Setup ipMonitor
  ipMonitor.start();
};

main();
