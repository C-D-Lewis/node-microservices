const { log, config } = require('./node-common')(['log', 'config']);
const { createSpotifyClient } = require('./modules/spotifyAuth');
const api = require('./modules/api');

/**
 * The main function.
 */
const main = async () => {
  config.validate();
  log.begin();

  await api.setup();

  try {
    await createSpotifyClient();
  } catch (e) {
    log.error('Failed to createSpotifyClient, credentials may be invalid');
    log.error(e);
  }
};

main();
