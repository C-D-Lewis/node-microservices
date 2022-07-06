const { conduit } = require('../node-common')(['conduit']);
const { getAppNames } = require('../modules/storage');

/**
 * Handle a 'listApps' topic packet.
 *
 * @param {object} packet - The conduit packet request.
 * @param {object} res - Express response object.
 */
const handleListAppsPacket = async (packet, res) => {
  const appNames = await getAppNames();

  conduit.respond(res, {
    status: 200,
    message: {
      appNames,
    },
  });
};

module.exports = handleListAppsPacket;
