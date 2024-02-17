const { log, config, attic } = require('./node-common')(['log', 'config', 'attic']);
const api = require('./modules/api');
const adminPassword = require('./modules/adminPassword');
const { migrateTokenUsers } = require('./modules/util');

/**
 * The main function.
 */
const main = async () => {
  log.begin({ appName: 'guestlist' });
  attic.setAppName('guestlist');

  await api.setup();

  await migrateTokenUsers();

  adminPassword.waitForFile();

  config.validate();
};

main();
