const { execSync } = require('child_process');
const { log } = require('../../node-common')(['log']);

/**
 * Get running container names.
 *
 * @returns {{name, status}} List of running containers.
 */
const getRunningContainers = () => {
  const output = execSync('docker ps --format \'{"name": "{{.Names}}", "status": "{{.Status}}"}\'')
    .toString()
    .trim();

  // No output if no containers
  if (!output.length) return [];

  const containers = output.split('\n').map((line) => JSON.parse(line));
  log.debug(`Running containers: ${JSON.stringify(containers)}`);
  return containers;
};

/**
 * Handle 'getRunningContainers' topic.
 *
 * @param {object} res - Express response object.
 * @returns {object} Express response.
 */
const handleGetRunningContainers = (res) => {
  log.debug('Get running docker command received');

  let containers = [];
  try {
    containers = getRunningContainers();
  } catch (e) {
    const error = `getRunningContainers() failed: ${e.message}`;
    log.error(error);
    return res.status(500).json({ error });
  }

  return res.status(200).json({ containers });
};

/**
 * Handle 'stopAllContainers' topic.
 *
 * @param {object} res - Express response object.
 * @returns {object} Express response.
 */
const handleStopAllContainers = (res) => {
  let containers = [];
  try {
    containers = getRunningContainers();
  } catch (e) {
    const error = `getRunningContainers() failed: ${e.message}`;
    log.error(error);
    return res.status(500).json({ error });
  }

  if (!containers.length) return res.status(200).json({ message: 'No running containers' });

  try {
    execSync(`docker stop ${containers.map((p) => p.name).join(' ')}`);
  } catch (e) {
    const error = `docker stop failed: ${e.message}`;
    log.error(error);
    return res.status(500).json({ error });
  }

  return res.status(200).json({ success: true });
};

module.exports = {
  handleGetRunningContainers,
  handleStopAllContainers,
};
