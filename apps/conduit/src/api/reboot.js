const { execSync } = require('child_process');
const { log } = require('../node-common')(['log']);

/** Time until reboot. */
const DELAY_MS = 10000;

/**
 * Handle an API request to reboot.
 *
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 */
const handleRebootRequest = async (req, res) => {
  try {
    setTimeout(() => execSync('sudo reboot'), DELAY_MS);
    log.info('Reboot command received');

    res.status(200).json({ content: `Restarting in ${DELAY_MS / 1000} seconds` });
  } catch (e) {
    const error = `Error performing reboot: ${e.stack}`;
    log.error(error);
    res.status(500).send({ error });
  }
};

module.exports = handleRebootRequest;
