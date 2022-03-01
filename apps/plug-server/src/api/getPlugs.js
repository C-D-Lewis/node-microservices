const { log, conduit } = require('../node-common')(['log', 'conduit']);
const devices = require('../modules/devices');

/**
 * Handle a 'getPlugs' topic packet.
 *
 * @param {object} packet - The conduit packet request.
 * @param {object} res - Express response object.
 */
const handleGetPlugs = (packet, res) => {
  const plugs = devices.getAvailablePlugs();

  conduit.respond(res, { status: 200, message: { plugs } });
};

module.exports = handleGetPlugs;