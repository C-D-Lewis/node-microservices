const { textDisplay, conduit } = require('../node-common')(['textDisplay', 'conduit']);

/**
 * Handle a 'setText' topic packet.
 *
 * @param {object} packet - The conduit packet request.
 * @param {object} res - Express response object.
 */
const handleSetTextPacket = (packet, res) => {
  const { lines } = packet.message;
  textDisplay.setLines(lines);

  conduit.respond(res, { status: 200, message: { content: 'OK' } });
};

module.exports = handleSetTextPacket;
