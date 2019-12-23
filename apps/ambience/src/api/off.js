const { conduit } = require('../node-common')(['conduit']);
const { clearAll } = require('../modules/anims');

/**
 * Handle a 'off' topic packet.
 *
 * @param {Object} packet - The conduit packet request.
 * @param {Object} res - Express response object.
 */
const handleOffPacket = async (packet, res) => {
  clearAll();

  await conduit.send({ to: 'visuals', topic: 'setAll', message: { all: [0, 0, 0] } });

  conduit.respond(res, { status: 200, message: { content: 'OK' } });
};

module.exports = handleOffPacket;
