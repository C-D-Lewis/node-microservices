const { config } = require('../node-common')(['config']);

/**
 * Handle a 'getPlugins' topic packet.
 *
 * @returns {object} Response data.
 */
const handleGetPluginsPacket = async () => ({ plugins: config.PLUGINS });

module.exports = handleGetPluginsPacket;
