const crypto = require('crypto');
const { ATTIC_KEY_USERS } = require('../constants');
const { attic, log } = require('../node-common')(['attic', 'log']);

const cache = {};

/**
 * Get hash of the token.
 *
 * THIS SHOULD NOT CHANGE WITHOUT MIGRATING TOKENS
 *
 * @param {string} token - Token provided.
 * @returns {string} Hash of the token.
 */
const getTokenHash = (token) => crypto.createHash('sha256').update(token).digest('hex');

/**
 * Validate permissions.
 *
 * @param {object[]} permissions - User's permissions list.
 */
const validatePermissions = (permissions) => {
  if (!(Array.isArray(permissions) && permissions.length > 0)) throw new Error('No permissions specified');

  // Permissions are 'device:app:topic'
  permissions.forEach((p) => {
    const [device, app, topic] = p.split(':');
    if (!(device && app && topic)) throw new Error(`Malformed permission: ${p}`);
  });
};

/**
 * Check the authorization of a packet against requested parameters.
 *
 * @param {string} auth - Authorization token.
 * @param {string} to - Destination app name.
 * @param {string} topic - Destination topic.
 * @param {string} device - Destination device hostname.
 * @returns {{ error }} - Error if any.
 */
const checkAuth = async (auth, to, topic, device) => {
  // Fetch user list
  // FIXME: If attic isn't running, no error is thrown
  const list = (await attic.exists(ATTIC_KEY_USERS))
    ? (await attic.get(ATTIC_KEY_USERS))
    : [];

  if (!cache[auth]) {
    cache[auth] = getTokenHash(auth);
  }
  const inputHash = cache[auth];

  // Check it exists
  const user = list.find((p) => p.hash === inputHash);
  if (!user) {
    log.debug(`Hash not found: ${inputHash}`);
    return { error: 'User does not exist' };
  }

  // Check at least some permissions
  const { permissions } = user;
  validatePermissions(permissions);

  for (let i = 0; i < permissions.length; i += 1) {
    const [d, a, t] = permissions[i].split(':');

    log.debug(`Permission check: req=${device}:${to}:${topic} perm=${d}:${a}:${t}`);

    // OK if match or 'all' for a given field
    if (
      (device === d || d === 'all')
      && (to === a || a === 'all')
      && (topic === t || t === 'all')
    ) return {};
  }

  return { error: `Invalid permissions for ${device}:${to}:${topic}` };
};

module.exports = {
  checkAuth,
  getTokenHash,
  validatePermissions,
};
