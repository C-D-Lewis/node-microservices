const { createAlarm } = require('../modules/alarm');
const {
  log, conduit, os, temperature,
} = require('../node-common')(['log', 'conduit', 'os', 'temperature']);
const { execSync } = require('child_process');
const { loadavg, freemem, totalmem } = require('os');
const { updateMetrics } = require('../modules/metrics');

/** Tolerable disk usage threshold */
const DISK_THRESHOLD = 80;
/** Main disk to check usage of */
const DISK_MOUNT = '/';

const seenDmesgErrors = [];
let diskAlarm;
let servicesAlarm;
let dmesgAlarm;

/**
 * Returns a list of errors with { time, message } objects.
 *
 * @param {string[]} lines - Array of dmesg lines to process.
 * @returns {DmesgError[]} - Array of error objects.
 */
const getDmesgErrors = (lines) => lines.reduce((acc, line) => {
  const time = line.split(']')[0].replace('[', '')?.trim();
  const message = line.split(']')[1]?.trim();
  return [
    ...acc,
    { time, message, line },
  ];
}, []);

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
 * Monitor system metrics.
 */
const monitorSystemMetrics = async () => {
  const freeMemory = freemem();
  const totalMemory = totalmem();
  const memoryPerc = 100 - (Math.round((freeMemory * 100) / totalMemory));
  const memoryMb = Math.round((totalMemory - freeMemory) / 1024 / 1024);

  const [cpuMinute] = loadavg();
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
};

/**
 * Create disk usage alarm.
 */
const createDiskUsageAlarm = () => {
  diskAlarm = createAlarm({
    name: 'disk-usage',
    testCb: async () => os.getDiskUsage().find((p) => p.usePerc > DISK_THRESHOLD),
    messageCb: (lowDisk) => {
      const {
        label, path, usePerc, size,
      } = lowDisk || {};
      return lowDisk
        ? `Low disk space - ${label} (${path}) has used ${usePerc}% of ${size}`
        : 'Disk usage is below threshold';
    },
  });
};

/**
 * Create services alarm.
 */
const createServicesAlarm = () => {
  servicesAlarm = createAlarm({
    name: 'services',
    testCb: async () => {
      const { message: apps } = await conduit.send({ to: 'conduit', topic: 'getApps' });

      // Find apps that are not OK
      const downApps = apps.reduce((result, item) => {
        log.debug(`Service ${item.app} returned ${item.status}`);
        if (item.status !== 'OK') result.push(item.app);

        return result;
      }, []);

      // Set new LED indicator state
      const allOk = downApps.length === 0;
      const serviceList = apps.map((p) => p.app).join(', ');
      log.info(`Services up: ${allOk} (${serviceList})`);

      return !allOk ? downApps : undefined;
    },
    messageCb: (downApps) => {
      return downApps && downApps.length > 0
        ? `The following services are down: ${downApps.join(', ')}`
        : 'All NMS services are operational';
    },
  });
};

/**
 * Create dmesg alarm.
 */
const createDmesgAlarm = () => {
  dmesgAlarm = createAlarm({
    name: 'dmesg',
    testCb: async () => {
      const lines = execSync('dmesg').toString().split('\n');
      const newErrors = getDmesgErrors(lines)
        .filter((p) => !!p.message)
        .filter((p) => ['error', 'fail'].some((q) => p.message.includes(q)))
        .filter((p) => !seenDmesgErrors.find((e) => e.time === p.time));

      // Remember new errors that were not already seen
      newErrors.forEach((p) => seenDmesgErrors.push(p));

      log.info(`new dmesg errors found: ${newErrors.length}`);
      return newErrors.length ? newErrors : undefined;
    },
    messageCb: (newErrors) => (newErrors
      ? `dmesg errors found!\n\n${newErrors.map((p) => p.line).join('\n')}`
      : 'No dmesg errors found.'),
    notifyOnRecover: false,
  });
};

/**
 * One plugin for multiple system monitoring functions.
 *
 * @returns {Promise<void>}
 */
module.exports = async () => {
  if (!diskAlarm) createDiskUsageAlarm();
  if (!servicesAlarm) createServicesAlarm();
  if (!dmesgAlarm) createDmesgAlarm();

  await diskAlarm.test();
  await servicesAlarm.test();
  await dmesgAlarm.test();

  monitorSystemMetrics();
};
