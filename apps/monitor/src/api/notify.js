const { conduit, ses, log } = require('../node-common')(['conduit', 'ses', 'log']);

/**
 * Handle a 'notify' topic packet.
 *
 * @param {object} packet - The conduit packet request.
 * @param {object} res - Express response object.
 */
const handleNotifyPacket = async (packet, res) => {
  const { content } = packet.message;

  try {
    await ses.notify(content);
    return conduit.respond(res, { status: 200, message: { content: 'success' } });
  } catch (e) {
    log.error(e);
    return conduit.respond(res, { status: 500, error: e.message });
  }
};

module.exports = handleNotifyPacket;
