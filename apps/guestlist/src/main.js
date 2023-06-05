const { log, config } = require('./node-common')(['log', 'config']);
const api = require('./modules/api');
const adminPassword = require('./modules/adminPassword');

/**
 * The main function.
 */
const main = async () => {
  log.begin({ appName: 'guestlist' });

  await api.setup();

  adminPassword.waitForFile();

  config.validate();
};

main();
