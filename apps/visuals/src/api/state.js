const handles = require('../modules/handles');
const { leds } = require('../node-common')(['leds']);

/**
 * Handle a 'state' topic packet.
 */
const handleStatePacket = async () => ({
  leds: leds.getState(),
  handles: Object.entries(handles.getAll()).map(([k, v]) => ({ [k]: !!v })),
});

module.exports = handleStatePacket;
