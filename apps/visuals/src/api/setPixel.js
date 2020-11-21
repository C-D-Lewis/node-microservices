const { leds, conduit } = require('../node-common')(['leds', 'conduit']);

/**
 * Handle a 'setPixel' topic packet.
 *
 * @param {Object} packet - The conduit packet request.
 * @param {Object} res - Express response object.
 */
const handleSetPixelPacket = (packet, res) => {
  const { message } = packet;
  for (let i = 0; i < leds.getNumLEDs(); i += 1) {
    if (message[i]) {
      leds.set(i, message[i]);
    }
  }

  conduit.respond(res, { status: 200, message: { content: 'OK' } });
};

module.exports = handleSetPixelPacket;
