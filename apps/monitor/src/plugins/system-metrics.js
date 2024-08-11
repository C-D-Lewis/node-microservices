const { loadavg, freemem, totalmem } = require('os');
const { log, temperature, os } = require('../node-common')(['log', 'temperature', 'os']);
const { updateMetrics } = require('../modules/metrics');

/**
 * Get disk usage stats.
 *
 * @param {string} mountPath - Mount path of drive to select.
 * @returns {object} Disk usage stats { diskGb, diskPerc }
 */
const getDiskUsage = (mountPath) => {
  const disks = os.getDiskUsage();
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
