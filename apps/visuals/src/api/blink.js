const { leds } = require('../node-common')(['leds']);

/**
 * Handle a 'blink' topic packet.
 *
 * @param {object} packet - The bifrost packet request.
 * @returns {object} Response data.
 */
const handleBlinkPacket = (packet) => {
  const { message } = packet;
  for (let i = 0; i < leds.getNumLEDs(); i += 1) {
    if (message[i]) {
      leds.blink(i, message[i]);
    }
  }

  return { content: 'OK' };
};

module.exports = handleBlinkPacket;
