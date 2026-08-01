const crypto = require('crypto');
const { readFileSync } = require('fs');
const { ATTIC_KEY_USERS } = require('../../constants');
const { getTokenHash, validatePermissions } = require('../../modules/auth');
const { log, attic } = require('../../node-common')(['log', 'attic']);

/** Reserved names for system roles */
const RESERVED_NAMES = ['superadmin'];
/** Length of IDs */
const ID_KEY_LENGTH = 16;
/** Path to the password file to read. */
const PASSWORD_FILE = `${__dirname}/../../../password`;

/**
 * Create a new user and insert it via attic.
 *
 * @param {object} message - Packet message.
 * @returns {object} Response data for caller.
 */
const createUser = async (message) => {
  const { name, permissions, adminPassword } = message;

  // Only the administrator can create users (for now)
  const password = readFileSync(PASSWORD_FILE, 'utf8').split('\n')[0].trim();
  if (!password.length) throw new Error('No password read');
  if (!password) throw new Error('Authorizing app not authorized');
  if (!adminPassword || adminPassword !== password) throw new Error('Unauthorized');
  if (RESERVED_NAMES.includes(name)) throw new Error('Cannot use reserved name');
  if (name.includes(' ')) throw new Error('Name may not contain spaces');

  // Additional validations
  validatePermissions(permissions);

  // Fetch user list
  const list = (await attic.exists(ATTIC_KEY_USERS))
    ? (await attic.get(ATTIC_KEY_USERS))
    : [];

  const existing = list.find((p) => p.name === name);
  if (existing) throw new Error('User already exists');

  const token = crypto.randomBytes(ID_KEY_LENGTH).toString('hex');
  const id = crypto.randomBytes(ID_KEY_LENGTH).toString('hex');
  const hash = getTokenHash(token);

  // Save it
  const user = {
    id,
    name,
    permissions,
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
  return response;
};

/**
 * Handle 'createUser' topic.
 *
 * @param {object} res - Express response object.
 * @param {object} message - Packet message.
 * @returns {object} Express response.
 */
const handleCreateUser = async (res, message) => {
  try {
    const data = await createUser(message);
    return res.status(201).json(data);
  } catch (e) {
    log.error(e);
    return res.status(500).json({ error: e.message });
  }
};

module.exports = {
  handleCreateUser,
};
