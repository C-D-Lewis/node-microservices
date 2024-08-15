const { execSync } = require('child_process');
const { log, ses } = require('../node-common')(['log', 'ses']);

let notified = false;

/**
 * Check running processes.
 *
 * @param {object} args - Plugin args.
 */
module.exports = async (args) => {
  const { PROCESSES = [] } = args;
  if (!PROCESSES.length) throw new Error('No processes to monitor');

  const stoppedProcesses = [];

  try {
    // Get processes
    PROCESSES.forEach((p) => {
      let running = false;
      try {
        running = execSync(`ps -e | grep ${p}`).toString().split('\n').length > 0;
      } catch (e) {
        /* Failed code */
      }

      log.debug(`Process ${p} running: ${running}`);

      if (!running) stoppedProcesses.push(p);
    });

    // Send notification once
    if (stoppedProcesses.length && !notified) {
      await ses.notify(`Processes stopped: ${stoppedProcesses.join(', ')}`);
      notified = true;
    }

    // Reset if recovers
    if (!stoppedProcesses.length && notified) {
      notified = false;
    }
  } catch (e) {
    log.error('Failed to check running processes');
    console.log(e);

    await ses.notify(`Failed to check running processes: ${e.stack}`);
  }
};
