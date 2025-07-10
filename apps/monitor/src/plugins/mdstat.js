const { execSync } = require('child_process');
const { log, ses } = require('../node-common')(['log', 'ses']);

/** Command to execute */
const CMD = 'cat /proc/mdstat';

let notified = false;

/**
 * Check disk state of RAID device (assume just 1)
 */
module.exports = async () => {
  try {
    const [, nameLine, blocksLine, line3] = execSync(CMD).toString().split('\n');
    const [arrayName] = nameLine.split(' ');
    const [, diskState] = blocksLine.split('[');

    // Number of active devices
    const desired = parseInt(diskState[0], 10);
    const current = parseInt(diskState[2], 10);
    const degraded = current < desired;

    // Recovery state
    let recoveryPercent;
    if (line3.includes('recov')) {
      recoveryPercent = parseFloat(line3.slice(line3.indexOf(' = ') + 3, line3.indexOf('%')));
    }
    log.info({
      arrayName, desired, current, degraded, recoveryPercent,
    });

    // Send notification once
    if (degraded && !notified) {
      await ses.notify('RAID array is in degraded state!');
      notified = true;
    }

    // Reset if recovers
    if (!degraded && notified) {
      notified = false;
    }
  } catch (e) {
    log.error('Failed to query RAID status');
    console.log(e);

    await ses.notify(`Failed to query RAID status: ${e.stack}`);
    notified = true;
  }
};
