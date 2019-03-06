const { log } = require('./node-common')(['log']);

const api = require('./modules/api');
const storage = require('./modules/storage');

const main = () => {
  log.begin();
  storage.init();
  api.setup();
};

main();
