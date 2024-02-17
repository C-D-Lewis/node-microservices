/* eslint-disable no-param-reassign */
const crypto = require('crypto');
const { ATTIC_KEY_USERS } = require('../constants');
const { log, attic } = require('../node-common')(['log', 'attic']);

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
 * Convert legacy users with 'token' instead of 'hash'.
 */
const migrateTokenUsers = async () => {
  // Read list
  const list = (await attic.exists(ATTIC_KEY_USERS))
    ? (await attic.get(ATTIC_KEY_USERS))
    : [];
  if (!list.length) {
    log.debug('No users to migrate');
    return;
  }

  // Migrate users
  list.forEach((user) => {
    if (user.token) {
      const hash = getTokenHash(user.token);
      delete user.token;
      user.hash = hash;
      log.info(`Migrated user ${user.id}`);
    }
  });

  // Write it back
  await attic.set(ATTIC_KEY_USERS, list);
};

module.exports = {
  getTokenHash,
  migrateTokenUsers,
};
