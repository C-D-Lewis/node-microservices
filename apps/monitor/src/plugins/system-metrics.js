const { loadavg, freemem, totalmem } = require('os');
const { execSync } = require('child_process');
const { log, temperature } = require('../node-common')(['log', 'temperature']);
const { updateMetrics } = require('../modules/metrics');

/**
 * Get disk usage stats.
 *
 * @param {string} mountPath - Mount path of drive to select.
 * @returns {object} Disk usage stats { diskGb, diskPerc }
 */
const getDiskUsage = (mountPath) => {
  const lines = execSync('df -h | grep "G "')
    .toString()
    .split('\n')
    .slice(1)
    .filter((p) => p.length > 0);
  const disks = lines.map((line) => {
    const [, size, used, , , path] = line
      .split(' ')
      .filter((p) => p.length);
    return {
      size,
      used,
      path,
    };
  });
  const found = disks.find((p) => p.path === mountPath);
  if (!found) throw new Error(`Failed to find disk with path ${mountPath}`);

  const { used, size } = found;
  const diskGb = parseFloat(used.replace('G', '').replace('M', ''), 10);
  const sizeGb = parseFloat(size.replace('G', '').replace('M', ''), 10);
  const diskPerc = Math.round((diskGb * 100) / sizeGb);

  return {
    diskGb,
    diskPerc,
  };
};

/**
 * Log metrics for system stats.
 *
 * @param {object} args - Plugin args.
 */
module.exports = async (args = {}) => {
  const { DISK_MOUNT = '/' } = args;
  try {
    const [cpuMinute] = loadavg();

    const freeMemory = freemem();
    const totalMemory = totalmem();
    const memoryPerc = 100 - (Math.round((freeMemory * 100) / totalMemory));
    const memoryMb = Math.round((totalMemory - freeMemory) / 1024 / 1024);

    const { diskGb, diskPerc } = getDiskUsage(DISK_MOUNT);

    const tempRaw = temperature.get();

    updateMetrics({
      cpu: cpuMinute,
      memoryPerc,
      memoryMb,
      diskGb,
      diskPerc,
      tempRaw,
    });
  } catch (e) {
    log.error(e);
  }
};
