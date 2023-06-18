const {
  log, config, attic, leds,
} = require('./node-common')(['log', 'config', 'attic', 'leds']);
const { createSpotifyClient } = require('./modules/spotifyAuth');
const api = require('./modules/api');

/**
 * The main function.
 */
const main = async () => {
  log.begin({ appName: 'visuals' });
  attic.setAppName('visuals');

  await api.setup();

  try {
    await createSpotifyClient();
  } catch (e) {
    log.error('Failed to createSpotifyClient, credentials may be invalid');
    log.error(e);
  }

  // Clear LEDs
  await leds.setAll([0, 0, 0]);

  config.validate();
};

main();
