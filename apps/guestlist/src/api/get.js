const { attic } = require('../node-common')(['attic']);
const { ATTIC_KEY_USERS } = require('../constants');

/**
 * Handle a 'get' topic packet.
 *
 * @param {object} packet - The conduit packet request.
 * @returns {object} Response data.
 */
const handleGetPacket = async (packet) => {
  const { name } = packet.message;

  // Fetch user list
  const list = (await attic.exists(ATTIC_KEY_USERS))
    ? (await attic.get(ATTIC_KEY_USERS))
    : [];

  // Check it doesn't already exist
  const user = list.find((p) => p.name === name);
  if (!user) return { error: 'User does not exist' };

  // Respond without token (should be remembered by client)
  const { token, ...response } = user;
  return response;
};

module.exports = handleGetPacket;
