const { log } = require('../node-common')(['log']);

/**
 * Handle a request to kill this service. Used by nms CLI.
 *
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 */
const handleKill = async (req, res) => {
  log.info('Process kill requested, shutting down');
  res.status(200).send({ stop: true });

  setTimeout(() => process.exit(), 1000);
};

module.exports = handleKill;
