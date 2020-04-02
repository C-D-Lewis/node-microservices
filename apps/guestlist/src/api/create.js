const Chance = require('chance');
const { conduit, attic } = require('../node-common')(['conduit', 'attic']);
const { ATTIC_KEY_USERS } = require('../constants');

/** Reserved names for system roles */
const RESERVED_NAMES = ['superadmin'];
/** Length of IDs */
const ID_LENGTH = 16;

const chance = new Chance();

/**
 * Handle a 'create' topic packet.
 *
 * @param {Object} packet - The conduit packet request.
 * @param {Object} res - Express response object.
 */
const handleCreatePacket = async (packet, res) => {
  const { name, password, apps, topics } = packet.message;

  // Handle bad inputs
  if (RESERVED_NAMES.includes(name)) {
    conduit.respond(res, { status: 409, error: 'Cannot use reserved name' });
    return;
  }
  if (name.includes(' ')) {
    conduit.respond(res, { status: 400, error: 'Name may not contain spaces' });
    return;
  }

  // Fetch user list
  const list = (await attic.exists(ATTIC_KEY_USERS))
    ? (await attic.get(ATTIC_KEY_USERS))
    : [];

  const existing = list.find(p => p.name === name);
  if (existing) {
    conduit.respond(res, { status: 409, error: 'User already exists' });
    return;
  }

  // Save it
  const user = {
    id: chance.hash({ length: ID_LENGTH }),
    name,
    apps,
    topics,
    password,
  };
  list.push(user);
  await attic.set(ATTIC_KEY_USERS, list);

  // Respond without password
  const { password: omittedPassword, ...responseUser } = user;
  conduit.respond(res, { status: 201, message: responseUser });
};

module.exports = handleCreatePacket;
