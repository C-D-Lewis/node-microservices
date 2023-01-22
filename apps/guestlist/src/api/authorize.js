const { attic } = require('../node-common')(['attic']);
const { ATTIC_KEY_USERS } = require('../constants');

/**
 * Handle a 'authorize' topic packet.
 *
 * @param {object} packet - The conduit packet request.
 * @returns {object} Response data.
 */
const handleAuthorizePacket = async (packet) => {
  const { auth, to, topic } = packet.message;

  // Fetch user list
  const list = (await attic.exists(ATTIC_KEY_USERS))
    ? (await attic.get(ATTIC_KEY_USERS))
    : [];

  // Check it exists
  const user = list.find((p) => p.token === auth);
  if (!user) return { error: 'User does not exist' };

  // Check apps
  if (!(user.apps.includes(to) || user.apps.includes('all'))) {
    return { error: `User is not permitted for app ${to}` };
  }

  // Check topics
  if (!(user.topics.includes(topic) || user.topics.includes('all'))) {
    return { error: `User is not permitted for topic ${topic}` };
  }

  // Respond
  return { content: 'OK' };
};

module.exports = handleAuthorizePacket;
