const { leds } = require('../node-common')(['leds']);
const handles = require('../modules/handles');

/**
 * Handle a 'setAll' topic packet.
 *
 * @param {object} packet - The bifrost packet request.
 */
const handleSetAllPacket = async (packet) => {
  handles.cancelAll();

  const { all } = packet.message;
  await leds.setAll(all);

  return { content: 'OK' };
};

module.exports = handleSetAllPacket;
