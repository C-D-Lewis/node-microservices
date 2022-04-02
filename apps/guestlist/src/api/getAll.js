const { conduit, attic } = require('../node-common')(['conduit', 'attic']);
const { ATTIC_KEY_USERS } = require('../constants');

/**
 * Handle a 'getAll' topic packet.
 *
 * @param {object} packet - The conduit packet request.
 * @param {object} res - Express response object.
 */
const handleGetAllPacket = async (packet, res) => {
  // Fetch user list
  const list = (await attic.exists(ATTIC_KEY_USERS))
    ? (await attic.get(ATTIC_KEY_USERS))
    : [];

  // Respond without token (should be remembered by client)
  const response = list.map((p) => {
    const { token, ...rest } = p;
    return rest;
  });
  conduit.respond(res, { status: 200, message: response });
};

module.exports = handleGetAllPacket;
