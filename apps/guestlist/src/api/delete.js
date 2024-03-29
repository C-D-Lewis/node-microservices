const { conduit, attic } = require('../node-common')(['conduit', 'attic']);
const { ATTIC_KEY_USERS } = require('../constants');
const adminPassword = require('../modules/adminPassword');

/**
 * Handle a 'delete' topic packet.
 *
 * @param {object} packet - The conduit packet request.
 * @param {object} res - Express response object.
 */
const handleDeletePacket = async (packet, res) => {
  const { message } = packet;
  const { name, adminPassword: inputPassword } = message;

  // Only the administrator can delete users (for now)
  const password = adminPassword.get();
  if (!password) {
    conduit.respond(res, { status: 500, error: 'Authorizing app not authorized' });
    return;
  }
  if (!inputPassword || inputPassword !== password) {
    conduit.respond(res, { status: 401, error: 'Unauthorized' });
    return;
  }

  // Fetch user list
  const list = (await attic.exists(ATTIC_KEY_USERS))
    ? (await attic.get(ATTIC_KEY_USERS))
    : [];

  // Find existing user
  const existing = list.find((p) => p.name === name);
  if (!existing) {
    conduit.respond(res, { status: 404, error: 'User does not exist' });
    return;
  }

  // Delete it
  list.splice(list.indexOf(existing), 1);
  await attic.set(ATTIC_KEY_USERS, list);

  // Respond
  conduit.respond(res, { status: 200, message: { content: 'Deleted' } });
};

module.exports = handleDeletePacket;
