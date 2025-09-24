const { execSync } = require('child_process');
const { log } = require('../node-common')(['log']);
const { updateMetrics } = require('../modules/metrics');
const { createAlert } = require('../modules/alert');

/** Grace period before starting alerting */
const GRACE_PERIOD_MS = 1000 * 60 * 10;

const start = Date.now();
let alert;

/**
 * Check running processes.
 *
 * @param {object} args - Plugin args.
 */
module.exports = async (args) => {
  const { FILTER = '', EXPECTED = 0 } = args;
  if (!FILTER.length) throw new Error('No processes filter to monitor');
  if (EXPECTED <= 0) throw new Error('Expected processes must be > 0');

  if (alert) {
    await alert.test();
    return;
  }

  alert = createAlert(
    'processes',
    async () => {
      const now = Date.now();
      if (now - start < GRACE_PERIOD_MS) {
        log.debug('Within processes.js GRACE_PERIOD_MS');
        return false;
      }

      // Get processes that meet this filter and count them
      let processCount = 0;
      try {
        processCount = execSync(`ps -e | grep ${FILTER}`)
          .toString()
          .split('\n')
          .filter((p) => p.length)
          .length;
      } catch (e) {
        /* Failed exit code */
      }

      const msg = `Processes matching ${FILTER} running: ${processCount} / ${EXPECTED}`;
      log.debug(msg);
      updateMetrics({ processCount });

      return processCount !== EXPECTED ? String(processCount) : undefined;
    },
    (processCount) => (processCount
      ? `Processes matching "${FILTER}" are not running as expected: ${processCount}/${EXPECTED}`
      : `Processes matching "${FILTER}" are running as expected`),
  );

  await alert.test();
};
