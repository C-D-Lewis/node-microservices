const { log } = require('@chris-lewis/node-common')(['log']);

const api = require('./modules/api');

(() => {
  log.begin();
  api.setup();
})();
