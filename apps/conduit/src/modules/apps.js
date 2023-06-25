const { config, log } = require('../node-common')(['config', 'log']);
const allocator = require('./allocator');
const util = require('./util');

const { SERVER } = config.get(['SERVER']);

/**
 * Get the status of an allocated app, and construct the response piece.
 *
 * @param {object} item - Allocator item.
 * @returns {Promise<object>} Status result
 */
const getAppStatus = async (item) => {
  try {
    const res = await util.sendPacket({ to: item.app, topic: 'status' });
    return {
      ...item,
      status: (res.message && res.message.content) ? res.message.content : JSON.stringify(res),
    };
  } catch (e) {
    log.error(e);
    return { ...item, status: e.message };
  }
};

/**
 * Collate status of all connected apps and response with a list.
 *
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 */
const respondWithApps = async (req, res) => {
  const apps = allocator.getAll();
  const result = await Promise.all(apps.map(getAppStatus));

  // Report conduit itself for completeness
  result.push({
    app: 'conduit',
    port: SERVER.PORT,
    status: 'OK',
    pid: process.pid,
  });

  // Response format is a packet
  res.status(200).send(JSON.stringify({ status: 200, message: result }));
};

module.exports = respondWithApps;
