const { log } = require('./node-common')(['log']);
const anims = require('./modules/anims');
const api = require('./modules/api');

const main = () => {
  log.begin();
  api.setup();

  // I'm alive!
  setTimeout(() => anims.fadeTo([128, 128, 128]), 1000);
  setTimeout(() => anims.fadeTo([0, 0, 0]), 5000);
};

main();