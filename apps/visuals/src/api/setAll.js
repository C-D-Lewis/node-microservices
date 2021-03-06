const { leds, conduit } = require('../node-common')(['leds', 'conduit']);

/**
 * Handle a 'setAll' topic packet.
 *
 * @param {Object} packet - The conduit packet request.
 * @param {Object} res - Express response object.
 */
const handleSetAllPacket = async (packet, res) => {
  const { all } = packet.message;
  await leds.setAll(all);

  conduit.respond(res, { status: 200, message: { content: 'OK' } });
};

module.exports = handleSetAllPacket;
