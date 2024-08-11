const { execSync } = require('child_process');
const log = require('./log');

/**
 * Get info on a storage device.
 *
 * @returns {Array<object>} List of disk info objects.
 */
const getDiskUsage = () => {
  const lines = execSync('df -h | grep "G "')
    .toString()
    .split('\n')
    .slice(1)
    .filter((p) => p.length > 0);

  return lines.map((line) => {
    const [label, size, used, available, usePerc, path] = line
      .split(' ')
      .filter((p) => p.length);
    const usePercInt = parseInt(usePerc, 10);
    log.debug(`${label} ${size} ${used} ${available} ${usePerc} ${path}`);
    return {
      label,
      size,
      used,
      available,
      usePerc: usePercInt,
      path,
    };
  });
};

module.exports = {
  getDiskUsage,
};
