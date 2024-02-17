const { conduit, attic, log } = require('../node-common')(['conduit', 'attic', 'log']);
const { ATTIC_KEY_USERS } = require('../constants');
const { getTokenHash } = require('../modules/util');

/**
 * Handle a 'authorize' topic packet.
 *
 * @param {object} packet - The conduit packet request.
 * @param {object} res - Express response object.
 */
const handleAuthorizePacket = async (packet, res) => {
  const {
    auth, to, topic, device,
  } = packet.message;

  // Fetch user list
  const list = (await attic.exists(ATTIC_KEY_USERS))
    ? (await attic.get(ATTIC_KEY_USERS))
    : [];

  // Check it exists
  const inputHash = getTokenHash(auth);
  const user = list.find((p) => p.hash === inputHash);
  if (!user) {
    log.debug(`Hash not found: ${inputHash}`);
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

  // Check devices - only if key has a restrictive list
  if (user.devices && !(user.devices.includes(device) || user.devices.includes('all'))) {
    conduit.respond(res, { status: 401, error: `User is not permitted for device ${device}` });
    return;
  }

  // Respond
  conduit.respond(res, { status: 200, message: { content: 'OK' } });
};

module.exports = handleAuthorizePacket;
