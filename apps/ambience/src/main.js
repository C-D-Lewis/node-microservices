const { log } = require('./node-common')(['log']);
const anims = require('./modules/anims');
const api = require('./modules/api');

const main = () => {
  log.begin();
  api.setup();

  setTimeout(() => anims.fadeTo([0, 128, 0]), 500);
  setTimeout(() => anims.fadeTo([0, 0, 0]), 15000);
};

main();
