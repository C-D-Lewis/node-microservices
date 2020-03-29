const { attic } = require('../node-common')(['attic']);

/**
 * Handle a 'create' topic packet.
 *
 * @param {Object} packet - The conduit packet request.
 * @param {Object} res - Express response object.
 */
const handleCreatePacket = async (packet, res) => {
  const { name, apps, topics } = packet.message;

  // Generate user ID and password

  // Store in attic

  conduit.respond(res, { status: 200, message: { content: 'OK' } });
};

module.exports = handleCreatePacket;
