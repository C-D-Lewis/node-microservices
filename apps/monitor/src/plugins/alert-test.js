const { createAlert } = require('../modules/alert');
const { log } = require('../node-common')(['log']);

let alert;

/**
 * Plugin to test the notification system.
 */
module.exports = async () => {
  if (alert) {
    await alert.test();
    return;
  }

  alert = createAlert({
    name: 'notify-test',
    /**
     * Test callback that randomly triggers an alert.
     *
     * @returns {Promise<{value: number}|undefined>} Test value if alert condition met.
     */
    testCb: async () => {
      const value = Math.round(Math.random() * 10);
      log.debug(`Test alert generated value: ${value.toFixed(2)}`);
      return value > 3 ? { value } : undefined;
    },
    /**
     * Message callback to format the alert message.
     *
     * @param {{value: number}|undefined} data - The data from the test callback.
     * @returns {string} The alert message.
     */
    messageCb: (data) => (data ? `Test alert value: ${data.value.toFixed(2)}` : 'Test alert cleared.'),
    notifyOnRecover: true,
    notifyUpdates: true,
  });

  await alert.test();
};
