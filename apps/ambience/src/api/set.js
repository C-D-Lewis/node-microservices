const { conduit } = require('../node-common')(['conduit']);

/**
 * Handle a 'set' topic packet.
 *
 * @param {Object} packet - The conduit packet request.
 * @param {Object} res - Express response object.
 */
const handleSetPacket = async (packet, res) => {
  const { all } = packet.message;
  await conduit.send({ to: 'visuals', topic: 'setAll', message: { all } });

  conduit.respond(res, { status: 200, message: { content: 'OK' } });
};

module.exports = handleSetPacket;
