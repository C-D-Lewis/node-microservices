const { log } = require('./node-common')(['log']);
const api = require('./modules/api');

const main = () => {
  log.begin();
  api.setup();
};

main();
