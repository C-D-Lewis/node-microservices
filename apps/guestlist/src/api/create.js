const Chance = require('chance');
const { conduit, attic } = require('../node-common')(['conduit', 'attic']);

/** Key for list of users */
const ATTIC_KEY_USERS = 'users';

const chance = new Chance();

/**
 * Handle a 'create' topic packet.
 *
 * @param {Object} packet - The conduit packet request.
 * @param {Object} res - Express response object.
 */
const handleCreatePacket = async (packet, res) => {
  const { name, apps, topics } = packet.message;

  const user = {
    name,
    apps,
    topics,
    password: chance.hash(),
  };

  // Fetch user list
  const list = (await attic.exists(ATTIC_KEY_USERS))
    ? (await attic.get(ATTIC_KEY_USERS))
    : [];

  // Check it doesn't already exist
  const existing = list.find(p => p.name === name);
  if (existing) {
    conduit.respond(res, { status: 409, error: 'User already exists' });
    return;
  }

  // Save it
  list.push(user);
  await attic.set(ATTIC_KEY_USERS, list);

  // Respond with password
  conduit.respond(res, { status: 201, message: user });
};

module.exports = handleCreatePacket;
