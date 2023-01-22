const Chance = require('chance');
const { attic } = require('../node-common')(['attic']);
const { ATTIC_KEY_USERS } = require('../constants');
const adminPassword = require('../modules/adminPassword');

/** Reserved names for system roles */
const RESERVED_NAMES = ['superadmin'];
/** Length of IDs */
const ID_LENGTH = 16;

const chance = new Chance();

/**
 * Handle a 'create' topic packet.
 * Requires 'auth' Conduit field containing 'adminPassword'.
 *
 * @param {object} packet - The conduit packet request.
 @returns {object} Response data.
 */
const handleCreatePacket = async (packet) => {
  const { message } = packet;
  const {
    name, apps, topics, adminPassword: inputPassword,
  } = message;

  // Only the administrator can create users (for now)
  const password = adminPassword.get();
  if (!password) return { error: 'Authorizing app not authorized' };
  if (!inputPassword || inputPassword !== password) return { error: 'Unauthorized' };
  if (RESERVED_NAMES.includes(name)) return { error: 'Cannot use reserved name' };
  if (name.includes(' ')) return { error: 'Name may not contain spaces' };

  // Fetch user list
  const list = (await attic.exists(ATTIC_KEY_USERS))
    ? (await attic.get(ATTIC_KEY_USERS))
    : [];

  const existing = list.find((p) => p.name === name);
  if (existing) return { error: 'User already exists' };

  // Save it
  const user = {
    id: chance.hash({ length: ID_LENGTH }),
    name,
    apps,
    topics,
    token: chance.hash(),
    createdAt: Date.now(),
  };
  list.push(user);
  await attic.set(ATTIC_KEY_USERS, list);

  // Respond
  return user;
};

module.exports = handleCreatePacket;
