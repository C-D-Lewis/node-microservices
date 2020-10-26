const { log, config } = require('./node-common')(['log', 'config']);
const { createSpotifyClient } = require('./modules/spotifyAuth');
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
const main = async () => {
  log.begin();
  api.setup();

  // Test Spotify credentials
  try {
    await createSpotifyClient();
  } catch (e) {
    log.error('Failed to createSpotifyClient:');
    log.error(e);
  }

  if (config.OPTIONS.SHOW_READY) {
    // Initial fade to green to show readiness
    setTimeout(() => anims.fadeTo([0, 128, 0]), 10000);
    setTimeout(() => anims.fadeTo([0, 0, 0]), 20000);
  }
};

main();
