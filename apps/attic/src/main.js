const { log } = require('./node-common')(['log']);
const api = require('./modules/api');
const storage = require('./modules/storage');

/**
 * The main function.
 */
const main = () => {
  log.begin();
  storage.init();
  api.setup();
};

main();
