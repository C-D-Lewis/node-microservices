const { createAlert } = require('../modules/alert');

const { os } = require('../node-common')(['os']);

let alert;

/**
 * Check disk state of local disks in the GB range.
 *
 * @param {object} args - Arguments for the disk usage check.
 * @param {number} args.THRESHOLD - Percentage threshold for low disk usage (default is 80).
 * @returns {Promise<void>} - Resolves when the alert is created and tested.
 */
module.exports = async (args = {}) => {
  const {
    THRESHOLD = 80,
  } = args;

  if (alert) {
    await alert.test();
    return;
  }

  alert = createAlert(
    'disk-usage',
    async () => {
      const disks = os.getDiskUsage();
      return disks.find((p) => p.usePerc > THRESHOLD);
    },
    (lowDisk) => {
      const {
        label, path, usePerc, size,
      } = lowDisk || {};
      return lowDisk
        ? `Low disk space - ${label} (${path}) has used ${usePerc}% of ${size}`
        : 'Disk usage is below threshold';
    },
  );

  await alert.test();
};
