import common from '../node-common';
import allocator from '../modules/allocator';
import util from '../modules/util';

const { config } = require()

const { SERVER } = config.get(['SERVER']);

/**
 * Get the status of an allocated app, and construct the response piece.
 *
 * @param {object} item - Allocator item.
 * @returns {Promise<Object>} Status result
 */
const getAppStatus = async (item) => {
  const res = await util.sendPacket({ to: item.app, topic: 'status' });
  return {
    ...item,
    status: (res.message && res.message.content) ? res.message.content : JSON.stringify(res),
  };
};

/**
 * Collate status of all connected apps and response with a list.
 *
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 */
export const respondWithApps = async (req, res) => {
  const apps = allocator.getAll();
  const result = await Promise.all(apps.map(getAppStatus));

  // Report conduit itself for completeness
  result.push({
    app: 'conduit',
    port: SERVER.PORT,
    status: 'OK',
    pid: process.pid,
  });

  res.status(200).send(JSON.stringify(result, null, 2));
};
