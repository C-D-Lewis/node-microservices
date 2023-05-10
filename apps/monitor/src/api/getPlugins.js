const { conduit, config } = require('../node-common')(['conduit', 'config']);

const { PLUGINS } = config.get(['PLUGINS']);

/**
 * Handle a 'getPlugins' topic packet.
 *
 * @param {object} packet - The conduit packet request.
 * @param {object} res - Express response object.
 */
const handleGetPluginsPacket = async (packet, res) => conduit.respond(
  res,
  { status: 200, message: PLUGINS },
);

module.exports = handleGetPluginsPacket;
