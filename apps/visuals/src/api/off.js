const { leds, conduit } = require('../node-common')(['leds', 'conduit']);
const handles = require('../modules/handles');

/**
 * Handle a 'off' topic packet.
 *
 * @param {object} packet - The conduit packet request.
 * @param {object} res - Express response object.
 */
const handleOffPacket = async (packet, res) => {
  handles.cancelAll();

  await leds.setAll([0, 0, 0]);

  conduit.respond(res, { status: 200, message: { content: 'OK' } });
};

module.exports = handleOffPacket;
