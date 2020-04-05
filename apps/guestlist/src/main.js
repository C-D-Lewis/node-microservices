const { log } = require('./node-common')(['log']);
const api = require('./modules/api');
const adminPassword = require('./modules/adminPassword');

/**
 * The main function.
 */
const main = () => {
  log.begin();
  api.setup();
  adminPassword.waitForFile();
};

main();
