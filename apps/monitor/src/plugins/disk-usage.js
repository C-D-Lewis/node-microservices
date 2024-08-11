const { log, ses, os } = require('../node-common')(['log', 'ses', 'os']);

/** Threshold to notify */
const THRESHOLD = 90;

let notified = false;

/**
 * Check disk state of local disks in the GB range.
 */
module.exports = async () => {
  try {
    const disks = os.getDiskUsage();

    const lowDisk = disks.find((p) => p.usePerc > THRESHOLD);

    // Send notification once
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
