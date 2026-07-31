const { execSync } = require('child_process');
const { DELAY_MS } = require('../../constants');
const { log } = require('../../node-common')(['log']);

/**
 * Handle 'shutdown' topic.
 *
 * @param {object} res - Express response object.
 * @returns {object} Express response.
 */
const handleShutdown = (res) => {
  log.info('Shutdown command received');
  setTimeout(() => execSync('sudo shutdown -h now'), DELAY_MS);

  return res.status(200).json({ content: 'Shutting down now' });
};

module.exports = {
  handleShutdown,
};
