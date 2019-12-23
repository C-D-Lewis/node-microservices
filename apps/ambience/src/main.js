const { log } = require('./node-common')(['log']);
const anims = require('./modules/anims');
const api = require('./modules/api');

/**
 * The main function.
 */
const main = () => {
  log.begin();
  api.setup();

  // Initial fade to green to show readiness
  setTimeout(() => anims.fadeTo([0, 128, 0]), 10000);
  setTimeout(() => anims.fadeTo([0, 0, 0]), 20000);
};

main();
