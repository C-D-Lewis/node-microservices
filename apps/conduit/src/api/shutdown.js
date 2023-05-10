const { execSync } = require('child_process');
const { log } = require('../node-common')(['log']);

/** Time until shutdown. */
const DELAY_MS = 10000;

/**
 * Handle an API request to shutdown.
 *
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 */
const handleShutdownRequest = async (req, res) => {
  try {
    setTimeout(() => execSync('sudo shutdown -h now'), DELAY_MS);
    log.info('Shutdown command received');

    res.status(200).json({ content: `Shutting down in ${DELAY_MS / 1000} seconds` });
  } catch (e) {
    const error = `Error performing shutdown: ${e.stack}`;
    log.error(error);
    res.status(500).send({ error });
  }
};

module.exports = handleShutdownRequest;
