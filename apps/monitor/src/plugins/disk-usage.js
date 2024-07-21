const { execSync } = require('child_process');
const { log, ses } = require('../node-common')(['log', 'ses']);

/** Threshold to notify */
const THRESHOLD = 90;

let notified = false;

/**
 * Check disk state of RAID device (assume just 1)
 */
module.exports = async () => {
  try {
    const lines = execSync('df -h | grep "G "')
      .toString()
      .split('\n')
      .slice(1)
      .filter((p) => p.length > 0);
    const disks = lines.map((line) => {
      const [label, size, used, available, usePerc, path] = line
        .split(' ')
        .filter((p) => p.length);
      const usePercInt = parseInt(usePerc, 10);
      const isOverThreshold = usePercInt > THRESHOLD;
      log.debug(`${label} ${size} ${used} ${available} ${usePerc} ${path} ${isOverThreshold}`);
      return {
        label,
        size,
        used,
        available,
        usePerc: usePercInt,
        path,
        isOverThreshold,
      };
    });

    // Send notification once
    const lowDisk = disks.find((p) => p.isOverThreshold);
    if (lowDisk && !notified) {
      const {
        label, path, usePerc, size,
      } = lowDisk;
      await ses.notify(`Low disk space - ${label} (${path}) has used ${usePerc}% of ${size}`);
      notified = true;
    }

    // Reset if recovers
    if (!lowDisk && notified) {
      notified = false;
    }
  } catch (e) {
    const msg = `Failed to check disk usage: ${e.stack}`;
    log.error(msg);
    console.log(e);

    await ses.notify(msg);
  }
};
