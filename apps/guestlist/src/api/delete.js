const { attic } = require('../node-common')(['attic']);
const { ATTIC_KEY_USERS } = require('../constants');
const adminPassword = require('../modules/adminPassword');

/**
 * Handle a 'delete' topic packet.
 *
 * @param {object} packet - The conduit packet request.
 * @returns {object} Response data.
 */
const handleDeletePacket = async (packet) => {
  const { message } = packet;
  const { name, adminPassword: inputPassword } = message;

  // Only the administrator can delete users (for now)
  const password = adminPassword.get();
  if (!password) return { error: 'Authorizing app not authorized' };
  if (!inputPassword || inputPassword !== password) return { error: 'Unauthorized' };

  // Fetch user list
  const list = (await attic.exists(ATTIC_KEY_USERS))
    ? (await attic.get(ATTIC_KEY_USERS))
    : [];

  // Find existing user
  const existing = list.find((p) => p.name === name);
  if (!existing) return { error: 'User does not exist' };

  // Delete it
  list.splice(list.indexOf(existing), 1);
  await attic.set(ATTIC_KEY_USERS, list);

  // Respond
  return { content: 'Deleted' };
};

module.exports = handleDeletePacket;
