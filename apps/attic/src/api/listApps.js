const { getAppNames } = require('../modules/storage');

/**
 * Handle a 'listApps' topic packet.
 *
 * @returns {object} Response data.
 */
const handleListAppsPacket = async () => ({ appNames: await getAppNames() });

module.exports = handleListAppsPacket;
