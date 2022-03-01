const { leds, conduit } = require('../node-common')(['leds', 'conduit']);

/**
 * Handle a 'blink' topic packet.
 *
 * @param {object} packet - The conduit packet request.
 * @param {object} res - Express response object.
 */
const handleBlinkPacket = (packet, res) => {
  const { message } = packet;
  for (let i = 0; i < leds.getNumLEDs(); i += 1) {
    if (message[i]) {
      leds.blink(i, message[i]);
    }
  }

  conduit.respond(res, { status: 200, message: { content: 'OK' } });
};

module.exports = handleBlinkPacket;
