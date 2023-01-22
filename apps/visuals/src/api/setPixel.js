const { leds } = require('../node-common')(['leds']);

/**
 * Handle a 'setPixel' topic packet.
 *
 * @param {object} packet - The bifrost packet request.
 * @returns {object} Response data.
 */
const handleSetPixelPacket = (packet) => {
  const { message } = packet;
  for (let i = 0; i < leds.getNumLEDs(); i += 1) {
    if (message[i]) {
      leds.set(i, message[i]);
    }
  }

  return { content: 'OK' };
};

module.exports = handleSetPixelPacket;
