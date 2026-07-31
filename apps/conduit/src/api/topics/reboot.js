const { execSync } = require('child_process');
const { DELAY_MS } = require('../../constants');
const { log } = require('../../node-common')(['log']);

/**
 * Handle 'reboot' topic.
 *
 * @param {object} res - Express response object.
 * @returns {object} Express response.
 */
const handleReboot = (res) => {
  log.info('Reboot command received');
  setTimeout(() => execSync('sudo reboot'), DELAY_MS);

  return res.status(200).json({ content: 'Restarting now' });
};

module.exports = {
  handleReboot,
};
