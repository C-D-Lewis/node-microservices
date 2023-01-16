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
  // TODO: Don't connect to self
  await bifrost.connect();
};

main();
