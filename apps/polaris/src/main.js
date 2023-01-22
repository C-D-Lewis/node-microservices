const { log, bifrost } = require('./node-common')(['log', 'bifrost']);
const ipMonitor = require('./modules/ipMonitor');

/**
 * The main function.
 */
const main = async () => {
  log.begin();

  await bifrost.connect();

  ipMonitor.start();
};

main();
