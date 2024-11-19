const { log, conduit, config } = require('../node-common')(['log', 'conduit', 'config']);

/**
 * Handle a 'hasLights' topic packet.
 *
 * @param {object} packet - The conduit packet request.
 * @param {object} res - Express response object.
 */
const handleHasLightsPacket = async (packet, res) => {
  try {
    const { LEDS } = config.get(['LEDS']);
    const hasLights = LEDS.USE_HARDWARE === true;
    conduit.respond(res, { status: 200, message: { hasLights } });
  } catch (e) {
    log.error(e);
    conduit.respond(res, { status: 500, error: e.message });
  }
};

module.exports = handleHasLightsPacket;
