const { conduit, config, log } = require('../node-common')(['conduit', 'config', 'log']);

const { PLUGINS } = config.get(['PLUGINS']);

/**
 * Handle a 'runPlugin' topic packet.
 *
 * @param {object} packet - The conduit packet request.
 * @param {object} res - Express response object.
 */
const handleRunPluginPacket = async (packet, res) => {
  const { fileName } = packet.message;

  try {
    // Get function
    const func = require(`${__dirname}/../plugins/${fileName}`);

    // Get args
    const found = PLUGINS.find((p) => p.FILE_NAME === fileName);
    if (!found) throw new Error('Plugin not configured');
    const args = found.ARGS || {};

    // Run it!
    await func(args);

    return conduit.respond(res, { status: 200, message: { success: true } });
  } catch (e) {
    const error = e.message;
    log.error(e.stack || e.message || e);
    return conduit.respond(res, { status: 400, message: { error } });
  }
};

module.exports = handleRunPluginPacket;
