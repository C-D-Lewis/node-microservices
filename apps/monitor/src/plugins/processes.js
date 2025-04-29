const { execSync } = require('child_process');
const { log, ses } = require('../node-common')(['log', 'ses']);
const { updateMetrics } = require('../modules/metrics');

/** Grace period before starting alerting */
const GRACE_PERIOD_MS = 1000 * 60 * 5;

const start = Date.now();
let notified = false;

/**
 * Check running processes.
 *
 * @param {object} args - Plugin args.
 */
module.exports = async (args) => {
  const { FILTER = '', EXPECTED = 0 } = args;
  if (!FILTER.length) throw new Error('No processes filter to monitor');
  if (EXPECTED <= 0) throw new Error('Expected processes must be > 0');

  const now = Date.now();

  if (now - start < GRACE_PERIOD_MS) {
    log.debug('Within processes.js GRACE_PERIOD_MS');
    return;
  }

  let processCount = 0;
  try {
    // Get processes that meet this filter and count them
    try {
      processCount = execSync(`ps -e | grep ${FILTER}`).toString().split('\n').filter((p) => p.length).length;
    } catch (e) {
      /* Failed exit code */
    }

    const msg = `Processes matching ${FILTER} running: ${processCount} / ${EXPECTED}`;
    log.debug(msg);
    updateMetrics({ processCount });

    // Send notification once
    const shouldNotify = processCount < EXPECTED;
    if (shouldNotify && !notified) {
      await ses.notify(msg);
      notified = true;
    }

    // Reset if recovers
    if (!shouldNotify && notified) {
      log.debug('Processes recovered');
      notified = false;
    }
  } catch (e) {
    log.error('Failed to check running processes');
    console.log(e);

    await ses.notify(`Failed to check running processes: ${e.stack}`);
  }
};
