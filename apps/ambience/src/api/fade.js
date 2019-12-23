const { conduit } = require('../node-common')(['conduit']);
const { fadeTo } = require('../modules/anims');

/**
 * Handle a 'fade' topic packet.
 *
 * @param {Object} packet - The conduit packet request.
 * @param {Object} res - Express response object.
 */
const handleFadePacket = (packet, res) => {
  fadeTo(packet.message.all);

  conduit.respond(res, { status: 200, message: { content: 'OK' } });
};

module.exports = handleFadePacket;
