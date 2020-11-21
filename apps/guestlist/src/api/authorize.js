const { conduit, attic } = require('../node-common')(['conduit', 'attic']);
const { ATTIC_KEY_USERS } = require('../constants');

/**
 * Handle a 'authorize' topic packet.
 *
 * @param {Object} packet - The conduit packet request.
 * @param {Object} res - Express response object.
 */
const handleAuthorizePacket = async (packet, res) => {
  const { token, to, topic } = packet.message;

  // Fetch user list
  const list = (await attic.exists(ATTIC_KEY_USERS))
    ? (await attic.get(ATTIC_KEY_USERS))
    : [];

  // Check it exists
  const user = list.find((p) => p.token === token);
  if (!user) {
    conduit.respond(res, { status: 404, error: 'User does not exist' });
    return;
  }

  // Check apps
  if (!(user.apps.includes(to) || user.apps.includes('all'))) {
    conduit.respond(res, { status: 401, error: `User is not permitted for app ${to}` });
    return;
  }

  // Check topics
  if (!(user.topics.includes(topic) || user.topics.includes('all'))) {
    conduit.respond(res, { status: 401, error: `User is not permitted for topic ${topic}` });
    return;
  }

  // Respond
  conduit.respond(res, { status: 200, message: { content: 'OK' } });
};

module.exports = handleAuthorizePacket;
