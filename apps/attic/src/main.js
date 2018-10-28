const { log } = require('@chris-lewis/node-common')(['log']);

const api = require('./modules/api');
const storage = require('./modules/storage');

(() => {
  log.begin();
  storage.init();
  api.setup();
})();
