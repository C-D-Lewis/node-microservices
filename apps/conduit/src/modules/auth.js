const { execSync } = require('child_process');
/* eslint-disable no-param-reassign */
const { attic, log } = require('../node-common')(['attic', 'log']);

/** Key for list of users */
const ATTIC_KEY_USERS = 'users';

/**
 * Get hash of the token. Uses same method as create-user.sh
 *
 * THIS SHOULD NOT CHANGE WITHOUT MIGRATING TOKENS
 *
 * @param {string} token - Token provided.
 * @returns {string} Hash of the token.
 */
const getTokenHash = (token) => execSync(`echo -n ${token} | sha256sum`).toString().split(' ')[0];

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
  let error;

  // Fetch user list
  const list = (await attic.exists(ATTIC_KEY_USERS))
    ? (await attic.get(ATTIC_KEY_USERS))
    : [];

  // Check it exists
  const inputHash = getTokenHash(auth);
  const user = list.find((p) => p.hash === inputHash);
  if (!user) {
    log.debug(`Hash not found: ${inputHash}`);
    return { error: 'User does not exist' };
  }

  // Check apps
  const apps = user.apps.split(',');
  if (!(apps.includes(to) || apps.includes('all'))) {
    return { error: `User is not permitted for app ${to}` };
  }

  // Check topics
  const topics = user.topics.split(',');
  if (!(topics.includes(topic) || topics.includes('all'))) {
    return { error: `User is not permitted for topic ${topic}` };
  }

  // Check devices - only if key has a restrictive list
  const devices = user.devices ? user.devices.split(',') : [];
  if (!(devices.includes(device) || devices.includes('all'))) {
    return { error: `User is not permitted for device ${device}` };
  }

  return { error };
};

module.exports = {
  checkAuth,
};
