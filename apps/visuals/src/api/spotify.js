const { log, conduit } = require('../node-common')(['log', 'conduit']);
const { startAnimation } = require('../modules/spotify');

/**
 * Handle a 'spotify' topic packet.
 *
 * @param {Object} packet - The conduit packet request.
 * @param {Object} res - Express response object.
 */
const handleSpotifyPacket = async (packet, res) => {
  try {
    const rgbArr = await startAnimation();
    conduit.respond(res, { status: 200, message: { content: rgbArr } });
  } catch (e) {
    log.error(e);
    conduit.respond(res, { status: 500, error: e.message });
  }
};

module.exports = handleSpotifyPacket;
