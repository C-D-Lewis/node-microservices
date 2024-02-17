const crypto = require('crypto');

/**
 * Get hash of the token.
 *
 * THIS SHOULD NOT CHANGE WITHOUT MIGRATING TOKENS
 *
 * @param {string} token - Token provided.
 * @returns {string} Hash of the token.
 */
const getTokenHash = (token) => crypto.createHash('sha256').update(token).digest('hex');

module.exports = {
  getTokenHash,
};
