const { createAlarm } = require('../modules/alarm');
const { log } = require('../node-common')(['log']);

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
    name: 'notify-test',
    /**
     * Test callback that randomly triggers an alarm.
     *
     * @returns {Promise<{value: number}|undefined>} Test value if alarm condition met.
     */
    testCb: async () => {
      const value = Math.round(Math.random() * 10);
      log.debug(`Test alarm generated value: ${value.toFixed(2)}`);
      return value > 3 ? { value } : undefined;
    },
    /**
     * Message callback to format the alarm message.
     *
     * @param {{value: number}|undefined} data - The data from the test callback.
     * @returns {string} The alarm message.
     */
    messageCb: (data) => (data ? `Test alarm value: ${data.value.toFixed(2)}` : 'Test alarm cleared.'),
    notifyOnRecover: true,
    notifyUpdates: true,
    sendEmails: false,
  });

  await alarm.test();
};
