const { log } = require('../node-common')(['log']);

/**
 * Handle a request for a port allocation for a service.
 *
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 */
 const handleKill = async (req, res) => {
  log.info(`Proces kill requested, shutting down`);
  res.status(200).send({ message: 'Stopping' });

  setTimeout(() => process.exit(), 1000);
};

module.exports = handleKill;
