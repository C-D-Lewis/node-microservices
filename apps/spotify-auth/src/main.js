const { conduit, log } = require('./node-common')(['conduit', 'log']);
const { authenticate } = require('./modules/auth');
const api = require('./modules/api');

/**
 * Test the credentials on boot to help debugging.
 */
const testCredentials = async () => {
  try {
    await authenticate();
    log.info('Credentials are valid');
  } catch (e) {
    log.error(e);
    log.error('Credentials are invalid!');
  }
};

/**
 * The main function.
 */
const main = async () => {
  log.begin();

  await conduit.register();
  api.setup();

  testCredentials();
};

main();
