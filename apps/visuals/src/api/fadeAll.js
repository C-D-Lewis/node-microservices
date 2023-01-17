const { leds } = require('../node-common')(['leds']);

/** Time before re-affirming an off fade */
const OFF_CONFIRMATION_MS = 10000;

/**
 * Handle a 'fadeAll' topic packet.
 *
 * @param {object} packet - The bifrost packet request.
 */
const handleFadeAllPacket = async (packet) => {
  const { to, from } = packet.message;
  await leds.fadeAll(to, from);

  // If fading to black, sometimes MOTE needs a confirmation 'set'
  if (to.every((p) => p === 0)) {
    setTimeout(() => leds.setAll(to), OFF_CONFIRMATION_MS);
  }

  return { message: { content: 'OK' } };
};

module.exports = handleFadeAllPacket;
