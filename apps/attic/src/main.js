const { log, config } = require('./node-common')(['log', 'config']);
const api = require('./modules/api');
const storage = require('./modules/storage');

/**
 * The main function.
 */
const main = async () => {
  config.validate();

  log.begin();

  storage.init();

  await api.setup();
};

main();
