const { loadavg, freemem, totalmem } = require('os');
const { execSync } = require('child_process');
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
 * Get current frequency as a percentage of reported maximum.
 *
 * @returns {number} Percentage of max frequency.
 */
const getFrequencyPerc = () => {
  try {
    const max = parseInt(
      execSync('cat /sys/devices/system/cpu/cpu0/cpufreq/scaling_max_freq').toString(),
      10,
    );
    const current = parseInt(
      execSync('cat /sys/devices/system/cpu/cpu0/cpufreq/scaling_cur_freq').toString(),
      10,
    );

    return Math.round((current * 100) / max);
  } catch (e) {
    log.error(e);
    return 0;
  }
};

/**
 * Get current fan speed.
 *
 * @returns {number} Fan speed in RPM.
 */
const getFanSpeed = () => {
  try {
    const speed = parseInt(
      execSync('cat /sys/devices/platform/cooling_fan/hwmon/*/fan1_input').toString(),
      10,
    );

    return speed || 0;
  } catch (e) {
    log.error(e);
    return 0;
  }
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

    const freqPerc = getFrequencyPerc();

    const fanSpeed = getFanSpeed();

    // Metrics with 'Perc' in the name are treated as a 0-100% range in the dashboard
    updateMetrics({
      cpu: cpuMinute,
      memoryPerc,
      memoryMb,
      diskGb,
      diskPerc,
      tempRaw,
      freqPerc,
      fanSpeed,
    });
  } catch (e) {
    log.error(e);
  }
};
