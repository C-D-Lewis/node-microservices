const { log, conduit, config } = require('./node-common')(['log', 'conduit', 'config']);
const server = require('./modules/server');

/**
 * The main function.
 */
const main = () => {
  log.begin({ appName: 'clacks' });

  // This should launch before conduit, but keep trying to connect
  const handle = setInterval(async () => {
    try {
      await conduit.register({ appName: 'clacks' });
      clearInterval(handle);
    } catch (e) {
      log.error(`Failed to register with conduit, is it up yet? ${e.message}`);
    }
  }, 5000);

  server.start();

  config.validate();
};

main();
