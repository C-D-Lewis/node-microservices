const { log, bifrost } = require('./node-common')(['log', 'bifrost']);
const api = require('./modules/api');
const adminPassword = require('./modules/adminPassword');

/**
 * The main function.
 */
const main = async () => {
  log.begin();
  await api.setup();

  adminPassword.watchForFile();

  try {
    // Ensure attic is available as the webhook store
    await bifrost.send({ to: 'attic', topic: 'status' });
  } catch (e) {
    log.error(e);
    log.fatal('Unable to reach attic!');
  }
};

main();
