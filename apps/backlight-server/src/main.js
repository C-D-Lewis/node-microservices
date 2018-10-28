const { log } = require('@chris-lewis/node-common')(['log']);

const anims = require('./modules/anims');
const api = require('./modules/api');

(() => {
  log.begin();
  api.setup();

  setTimeout(() => anims.fadeTo([128, 128, 128]), 1000);
  setTimeout(() => anims.fadeTo([0, 0, 0]), 5000);
})();
