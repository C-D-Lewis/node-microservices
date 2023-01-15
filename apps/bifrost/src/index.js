const { log } = require('./node-common')(['log']);
const { startServer } = require('./modules/server');

/**
 * The main function.
 */
const main = async () => {
  log.begin();

  await startServer();
  log.info('Ready for clients');

  // TODO: Fleet checkin
};

main();
