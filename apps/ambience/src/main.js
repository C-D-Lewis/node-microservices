const { log, config } = require('./node-common')(['log', 'config']);
const anims = require('./modules/anims');
const api = require('./modules/api');

config.requireKeys('main.js', {
  required: ['OPTIONS'],
  properties: {
    OPTIONS: {
      required: ['SHOW_READY'],
      properties: {
        SHOW_READY: { type: 'boolean' },
      }
    },
  },
});

/**
 * The main function.
 */
const main = () => {
  log.begin();
  api.setup();

  if (config.OPTIONS.SHOW_READY) {
    // Initial fade to green to show readiness
    setTimeout(() => anims.fadeTo([0, 128, 0]), 10000);
    setTimeout(() => anims.fadeTo([0, 0, 0]), 20000);
  }
};

main();
