const { spawn, execSync } = require('child_process');
const { DELAY_MS } = require('../../constants');
const { log } = require('../../node-common')(['log']);

/**
 * Handle 'upgrade' topic.
 *
 * @param {object} res - Express response object.
 * @returns {object} Express response.
 */
const handleUpgrade = (res) => {
  log.info('Upgrade command received');
  setTimeout(() => {
    const proc = spawn('sudo', ['sh', '-c', 'apt update && apt upgrade -y && apt autoremove -y']);
    proc.stderr.on('data', (data) => log.warn(`upgrade stderr: ${data}`));
  }, DELAY_MS);

  return res.status(200).json({ content: 'Upgrading now' });
};

/**
 * Handle 'getIsUpgrading' topic.
 *
 * @param {object} res - Express response object.
 * @returns {object} Express response.
 */
const handleGetIsUpgrading = (res) => {
  log.debug('Get is upgrading command received');

  let output;
  try {
    output = execSync('ps -e | grep apt').toString() || 'no output';
    log.debug(output);
  } catch (e) {
    log.error(e);
    const stdout = e.stdout ? e.stdout.toString() : '';
    const stderr = e.stderr ? e.stderr.toString() : '';
    output = stdout || stderr || 'no output';
    log.error(output);
  }

  return res.status(200).json({ upgrading: output.includes('apt') });
};

module.exports = {
  handleUpgrade,
  handleGetIsUpgrading,
};
