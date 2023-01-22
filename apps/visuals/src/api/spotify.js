const { log } = require('../node-common')(['log']);
const { startAnimation } = require('../modules/spotify');

/**
 * Handle a 'spotify' topic packet.
 */
const handleSpotifyPacket = async () => {
  try {
    const rgbArr = await startAnimation();
    return { content: rgbArr };
  } catch (e) {
    log.error(e);
    return { error: e.message };
  }
};

module.exports = handleSpotifyPacket;
