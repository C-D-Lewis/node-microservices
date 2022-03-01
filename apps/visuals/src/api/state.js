const handles = require('../modules/handles');

const { leds, conduit } = require('../node-common')(['leds', 'conduit']);

/**
 * Handle a 'state' topic packet.
 *
 * @param {object} packet - The conduit packet request.
 * @param {object} res - Express response object.
 */
const handleStatePacket = async (packet, res) => {
  const message = {
    leds: leds.getState(),
    handles: Object.entries(handles.getAll()).map(([k, v]) => ({ [k]: !!v })),
  };
  await conduit.respond(res, { status: 200, message });
};

module.exports = handleStatePacket;
