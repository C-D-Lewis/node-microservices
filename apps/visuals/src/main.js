const { log } = require('./node-common')(['log']);
const api = require('./modules/api');

(() => {
  log.begin();
  api.setup();
})();
