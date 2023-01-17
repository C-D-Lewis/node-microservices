const { leds } = require('../node-common')(['leds']);
const handles = require('../modules/handles');

/**
 * Handle a 'off' topic packet.
 */
const handleOffPacket = async () => {
  handles.cancelAll();

  await leds.setAll([0, 0, 0]);

  return { message: { content: 'OK' } };
};

module.exports = handleOffPacket;
