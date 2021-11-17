const { log } = require('./node-common')(['log']);
const server = require('./modules/server');

/**
 * The main function.
 */
const main = () => {
  log.begin();

  // Setup WS server
  server.start();
};

main();
