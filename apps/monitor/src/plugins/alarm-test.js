const { createAlarm } = require('../modules/alarm');
const { log } = require('../node-common')(['log']);

/** Test alarm threshold */
const THRESHOLD = 3;

let alarm;

/**
 * Plugin to test the notification system.
 */
module.exports = async () => {
  if (alarm) {
    await alarm.test();
    return;
  }

  alarm = createAlarm({
    name: 'alarm-test',
    /**
     * Test callback that randomly triggers an alarm.
     *
     * @returns {Promise<{value: number}|undefined>} Test value if alarm condition met.
     */
    testCb: async () => {
      const value = Math.round(Math.random() * 10);
      log.debug(`Test alarm value: ${value} / ${THRESHOLD}`);
      return value > THRESHOLD ? value : undefined;
    },
    /**
     * Message callback to format the alarm message.
     *
     * @param {number|undefined} data - The data from the test callback.
     * @returns {string} The alarm message.
     */
    messageCb: (data) => (data ? `Test alarm value: ${data}` : 'Test alarm cleared.'),
    notifyOnRecover: true,
    notifyUpdates: true,
    sendEmails: false,
  });

  await alarm.test();
};
