const { conduit, attic } = require('../node-common')(['conduit', 'attic']);
const { ATTIC_KEY_USERS } = require('../constants');

/**
 * Handle a 'authorize' topic packet.
 *
 * @param {Object} packet - The conduit packet request.
 * @param {Object} res - Express response object.
 */
const handleAuthorizePacket = async (packet, res) => {
  const { token } = packet.message;

  // Fetch user list
  const list = (await attic.exists(ATTIC_KEY_USERS))
    ? (await attic.get(ATTIC_KEY_USERS))
    : [];

  // Check it exists
  const user = list.find(p => p.token === token);
  if (!user) {
    conduit.respond(res, { status: 404, error: 'User does not exist' });
    return;
  }

  // TODO - Check app name and topics!

  // Respond
  conduit.respond(res, { status: 200, message: { content: 'OK' } });
};

module.exports = handleAuthorizePacket;
