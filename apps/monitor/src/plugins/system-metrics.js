const { loadavg, freemem, totalmem } = require('os');
const { execSync } = require('child_process');
const { readFileSync, unlinkSync } = require('fs');
const { log, temperature } = require('../node-common')(['log', 'temperature']);
const { updateMetrics } = require('../modules/metrics');

/**
 * Get disk usage stats.
 *
 * @returns {object} Disk usage stats { diskGb, diskPerc }
 */
const getDiskUsage = () => {
  execSync('df -h > df.txt');
  const line = readFileSync('df.txt').toString().split('\n')[1];
  const [, , diskGb, , diskPerc] = line.split(' ').filter((p) => p);
  unlinkSync('df.txt');

  return {
    diskGb: parseFloat(diskGb.replace('G', '').replace('M', ''), 10),
    diskPerc: parseInt(diskPerc.replace('%', ''), 10),
  };
};

/**
 * Log metrics for system stats.
 */
module.exports = async () => {
  try {
    const [cpuMinute] = loadavg();

    const freeMemory = freemem();
    const totalMemory = totalmem();
    const memoryPerc = 100 - (Math.round((freeMemory * 100) / totalMemory));
    const memoryMb = Math.round((totalMemory - freeMemory) / 1024 / 1024);

    const { diskGb, diskPerc } = getDiskUsage();

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
