const { leds, conduit } = require('../node-common')(['leds', 'conduit']);
const handles = require('../modules/handles');

/**
 * Handle a 'setAll' topic packet.
 *
 * @param {object} packet - The conduit packet request.
 * @param {object} res - Express response object.
 */
const handleSetAllPacket = async (packet, res) => {
  handles.cancelAll();

  const { all } = packet.message;
  await leds.setAll(all);

  conduit.respond(res, { status: 200, message: { content: 'OK' } });
};

module.exports = handleSetAllPacket;
