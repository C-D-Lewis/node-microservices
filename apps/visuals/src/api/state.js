const { leds, conduit } = require('../node-common')(['leds', 'conduit']);

/**
 * Handle a 'state' topic packet.
 *
 * @param {Object} packet - The conduit packet request.
 * @param {Object} res - Express response object.
 */
const handleStatePacket = (packet, res) =>
  conduit.respond(res, { status: 200, message: { leds: leds.getState() } });

module.exports = handleStatePacket;
