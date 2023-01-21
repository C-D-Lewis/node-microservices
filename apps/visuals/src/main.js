const { log } = require('./node-common')(['log']);
const { createSpotifyClient } = require('./modules/spotifyAuth');
const api = require('./modules/api');

/**
 * The main function.
 */
const main = async () => {
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
