const { leds, conduit } = require('../node-common')(['leds', 'conduit']);

/** Time before re-affirming an off fade */
const OFF_CONFIRMATION_MS = 10000;

/**
 * Handle a 'fadeAll' topic packet.
 *
 * @param {Object} packet - The conduit packet request.
 * @param {Object} res - Express response object.
 */
const handleFadeAllPacket = async (packet, res) => {
  const { to, from } = packet.message;
  await leds.fadeAll(to, from);

  // If fading to black, sometimes MOTE needs a confirmation 'set'
  if (to.every((p) => p === 0)) {
    setTimeout(() => leds.setAll(to), OFF_CONFIRMATION_MS);
  }

  conduit.respond(res, { status: 200, message: { content: 'OK' } });
};

module.exports = handleFadeAllPacket;
