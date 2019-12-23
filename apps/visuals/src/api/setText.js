const { textDisplay, conduit } = require('../node-common')(['textDisplay', 'conduit']);

/**
 * Handle a 'setText' topic packet.
 *
 * @param {Object} packet - The conduit packet request.
 * @param {Object} res - Express response object.
 */
const handleSetTextPacket = (packet, res) => {
  const { lines } = packet.message;
  textDisplay.setLines(lines);

  conduit.respond(res, { status: 200, message: { content: 'OK' } });
};

module.exports = handleSetTextPacket;
