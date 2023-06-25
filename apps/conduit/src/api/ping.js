const { log } = require('../node-common')(['log']);

/**
 * Handle a ping request.
 *
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 */
const handlePing = async (req, res) => {
  log.info('Ping requested');
  res.status(200).send({ pong: true });
};

module.exports = handlePing;
