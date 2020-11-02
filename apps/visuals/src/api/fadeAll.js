const { leds, conduit } = require('../node-common')(['leds', 'conduit']);

/**
 * Handle a 'fadeAll' topic packet.
 *
 * @param {Object} packet - The conduit packet request.
 * @param {Object} res - Express response object.
 */
const handleFadeAllPacket = async (packet, res) => {
  const { to, from } = packet.message;
  await leds.fadeAll(to, from);

  conduit.respond(res, { status: 200, message: { content: 'OK' } });
};

module.exports = handleFadeAllPacket;
