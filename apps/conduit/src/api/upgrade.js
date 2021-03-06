const { execSync } = require('child_process');
const { log } = require('../node-common')(['log']);

/** Time until reboot. */
const DELAY_MS = 10000;

/**
 * Handle an API request to do a git upgrade.
 *
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
const handleUpgradeRequest = async (req, res) => {
  try {
    execSync('git checkout ../..');
    execSync('git reset --hard HEAD');
    execSync('git pull origin master');

    setTimeout(() => execSync('sudo reboot'), DELAY_MS);

    res.status(200).json({ content: `Restarting in ${DELAY_MS / 1000} seconds` });
  } catch (e) {
    const error = `Error performing upgrade: ${e.stack}`;
    log.error(error);
    res.status(500).send({ error });
  }
};

module.exports = handleUpgradeRequest;
