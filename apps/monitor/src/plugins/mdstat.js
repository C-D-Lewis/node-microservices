const { execSync } = require('child_process');
const { log, ses } = require('../node-common')(['log', 'ses']);

/** Command to execute */
const CMD = 'cat /proc/mdstat';

/**
 * Function to check a condition and notify once if it fails.
 *
 * @param {string} name - Name of the notifiable condition.
 * @param {Function} testCb - Callback to test the condition.
 * @param {Function} messageCb - Callback to generate the notification message.
 * @returns {object} - An object with a check method to perform the test.
 */
const Notifiable = (name, testCb, messageCb) => {
  let notified = false;

  return {
    /**
     * Check the condition and notify if necessary.
     *
     * @returns {Promise<void>}
     */
    check: async () => {
      try {
        const success = await testCb();
        if (success) {
          notified = false;
          return;
        }

        if (!notified) {
          const msg = messageCb(success);
          log.debug(`Notifiable sent: ${msg}`);
          await ses.notify(msg);
          notified = true;
        }
      } catch (e) {
        const err = `Notifiable failed: ${e.message}`;
        log.error(err);
        console.log(e);

        await ses.notify(err);
        notified = true;
      }
    },
  };
};

let notifiable;

/**
 * Check disk state of RAID device (assume just 1)
 */
module.exports = async () => {
  if (notifiable) {
    return notifiable.check();
  }

  notifiable = Notifiable(
    'mdstat',
    async () => {
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

      return !degraded;
    },
    () => 'RAID array is in degraded state!',
  );

  return notifiable.check();
};
