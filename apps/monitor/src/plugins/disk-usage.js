const { createAlert } = require('../modules/alert');

const { os } = require('../node-common')(['os']);

let alert;
let lowDisk;

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
      lowDisk = disks.find((p) => p.usePerc > THRESHOLD);

      return !lowDisk;
    },
    (success) => {
      const {
        label, path, usePerc, size,
      } = lowDisk || {};
      const msg = success
        ? 'Disk usage is below threshold'
        : `Low disk space - ${label} (${path}) has used ${usePerc}% of ${size}`;

      return msg;
    },
  );

  await alert.test();
};
