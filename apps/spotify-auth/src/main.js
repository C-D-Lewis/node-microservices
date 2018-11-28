const {
  conduit, log
} = require('@chris-lewis/node-common')(['conduit', 'log']);

const api = require('./modules/api');
const auth = require('./modules/auth');

const testCredentials = async () => {
  try {
    await auth.authenticate();
    log.info('Credentials are valid');
  } catch (e) {
    log.error('Credentials are invalid!');
  }
};

(async () => {
  log.begin();

  await conduit.register();
  api.setup();

  testCredentials();
})();