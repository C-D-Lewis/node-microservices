const { execSync } = require('child_process');
const { createAlarm } = require('../modules/alarm');
const { log } = require('../node-common')(['log']);

/** Command to execute */
const CMD = 'cat /proc/mdstat';

let alarm;

/**
 * Check disk state of RAID device (assume just 1)
 */
module.exports = async () => {
  if (alarm) {
    await alarm.test();
    return;
  }

  alarm = createAlarm({
    name: 'mdstat',
    testCb: async () => {
      const stdout = execSync(CMD).toString().split('\n');
      if (!stdout.includes('active')) {
        // Error because if this plugin is running there should be a RAID array
        log.error('No active RAID arrays found');
        return true;
      }

      const [, nameLine, blocksLine, line3] = stdout;
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
      log.debug({
        arrayName, desired, current, degraded, recoveryPercent,
      });

      return degraded;
    },
    messageCb: (degraded) => (degraded
      ? 'RAID array is in degraded state!'
      : 'RAID array is healthy'),
    sendEmails: false,
  });

  await alarm.test();
};
