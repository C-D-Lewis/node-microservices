const { log, bifrost } = require('./node-common')(['log', 'bifrost']);
const { startServer } = require('./modules/server');

/**
 * The main function.
 */
const main = async () => {
  log.begin();

  await startServer();
  log.info('Ready for clients');

  // TODO: fleet checkin
  await bifrost.connect();
};

main();
