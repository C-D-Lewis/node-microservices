const crypto = require('crypto');
const { conduit, attic } = require('../node-common')(['conduit', 'attic']);
const { ATTIC_KEY_USERS } = require('../constants');
const adminPassword = require('../modules/adminPassword');
const { getTokenHash } = require('../modules/util');

/** Reserved names for system roles */
const RESERVED_NAMES = ['superadmin'];
/** Length of IDs */
const ID_KEY_LENGTH = 16;

/**
 * Handle a 'create' topic packet.
 * Requires 'auth' Conduit field containing 'adminPassword'.
 *
 * @param {object} packet - The conduit packet request.
 * @param {object} res - Express response object.
 */
const handleCreatePacket = async (packet, res) => {
  const { message } = packet;
  const {
    name, apps, topics, devices = [], adminPassword: inputPassword,
  } = message;

  // Only the administrator can create users (for now)
  const password = adminPassword.get();
  if (!password) {
    conduit.respond(res, { status: 500, error: 'Authorizing app not authorized' });
    return;
  }
  if (!inputPassword || inputPassword !== password) {
    conduit.respond(res, { status: 401, error: 'Unauthorized' });
    return;
  }
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

  const existing = list.find((p) => p.name === name);
  if (existing) {
    conduit.respond(res, { status: 409, error: 'User already exists' });
    return;
  }

  const token = crypto.randomBytes(ID_KEY_LENGTH).toString('hex');
  const id = crypto.randomBytes(ID_KEY_LENGTH).toString('hex');
  const hash = getTokenHash(token);

  // Save it
  const user = {
    id,
    name,
    apps,
    topics,
    devices,
    hash,
    createdAt: Date.now(),
  };
  list.push(user);
  await attic.set(ATTIC_KEY_USERS, list);

  // Respond with token just once
  const response = {
    ...user,
    token,
  };
  conduit.respond(res, { status: 201, message: response });
};

module.exports = handleCreatePacket;
