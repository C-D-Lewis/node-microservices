const { log } = require('./node-common')(['log']);
const api = require('./modules/api');

/**
 * The main function.
 */
const main = () => {
  log.begin();
  api.setup();
};

main();
