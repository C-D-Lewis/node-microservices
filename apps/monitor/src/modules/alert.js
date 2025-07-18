const { log, ses } = require('../node-common')(['log', 'ses']);

/**
 * Function to check a condition and notify once if it fails.
 *
 * @param {string} name - Name of the notifiable condition.
 * @param {Function} testCb - Callback to test the condition.
 * @param {Function} messageCb - Callback to generate the notification message.
 * @returns {object} - An object with a check method to perform the test.
 */
const createAlert = (name, testCb, messageCb) => {
  let notified = false;

  /**
   * Log and send the notification message.
   *
   * @param {string} msg - The message to notify.
   * @param {boolean} isSuccess - Whether the notification is a success message.
   * @param {boolean} isError - Whether the notification is an error in testing.
   * @returns {Promise<void>}
   */
  const notify = (msg, isSuccess, isError) => {
    if (isError) {
      log.error(`Alert "${name}" test failed: ${msg}`);
      return ses.notifyError(msg);
    }
    
    const finalMsg = `Alert "${name}" ${isSuccess ? 'closed' : 'open'}: ${msg}`
    log.info(finalMsg);
    return ses.notify(finalMsg);
  };

  return {
    /**
     * Check the condition and notify if necessary.
     *
     * @returns {Promise<void>}
     */
    test: async () => {
      try {
        const result = await testCb();
        if (result) {
          // Still good
          if (!notified) return;
            
          // Now recovered
          notified = false;
          return notify(messageCb(result), true);
        }

        // Now failed
        if (!notified) {
          notified = true;
          return notify(messageCb(result));
        }
      } catch (e) {
        console.log(e);

        return notify(e.stack || e.message, false, true);
      }
    },
  };
};

module.exports = {
  createAlert,
};
