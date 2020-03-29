const { conduit, attic } = require('../node-common')(['conduit', 'attic']);

/** Key for list of users */
const ATTIC_KEY_USERS = 'users';

/**
 * Handle a 'get' topic packet.
 *
 * @param {Object} packet - The conduit packet request.
 * @param {Object} res - Express response object.
 */
const handleGetPacket = async (packet, res) => {
  const { name } = packet.message;

  // Fetch user list
  const list = (await attic.exists(ATTIC_KEY_USERS))
    ? (await attic.get(ATTIC_KEY_USERS))
    : [];

  // Check it doesn't already exist
  const user = list.find(p => p.name === name);
  if (!user) {
    conduit.respond(res, { status: 404, error: 'User does not exist' });
    return;
  }

  // Respond without password
  const { password, ...response } = user;
  conduit.respond(res, { status: 200, message: response });
};

module.exports = handleGetPacket;
