const { log, conduit } = require('../node-common')(['log', 'conduit']);
const { spotifyAnimation } = require('../modules/anims');

/**
 * Handle a 'spotify' topic packet.
 *
 * @param {Object} packet - The conduit packet request.
 * @param {Object} res - Express response object.
 */
const handleSpotifyPacket = async (packet, res) => {
  try {
    const rgbArr = await spotifyAnimation();

    conduit.respond(res, { status: 200, message: { content: rgbArr } });
  } catch (e) {
    log.error(e);
    conduit.respond(res, { status: 500, error: e.message });
  }
};

module.exports = handleSpotifyPacket;
