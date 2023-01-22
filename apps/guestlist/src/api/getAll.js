const { attic } = require('../node-common')(['attic']);
const { ATTIC_KEY_USERS } = require('../constants');

/**
 * Handle a 'getAll' topic packet.
 *
 * @returns {object} Response data.
 */
const handleGetAllPacket = async () => {
  // Fetch user list
  const list = (await attic.exists(ATTIC_KEY_USERS))
    ? (await attic.get(ATTIC_KEY_USERS))
    : [];

  // Respond without token (should be remembered by client)
  return list.map((p) => {
    const { token, ...rest } = p;
    return rest;
  });
};

module.exports = handleGetAllPacket;
