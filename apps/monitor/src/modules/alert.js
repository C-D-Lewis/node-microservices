const { log, ses } = require('../node-common')(['log', 'ses']);

/**
 * Function to check a condition and notify once if it fails.
 *
 * @param {object} opts - Function options.
 * @param {string} opts.name - Name of the notifiable condition.
 * @param {Function} opts.testCb - Callback to test the condition.
 *                            Return data if there is a problem, undefined otherwise.
 * @param {Function} opts.messageCb - Callback to generate the notification message.
 * @param {boolean} [opts.notifyOnRecover=true] - Whether to notify when the condition recovers.
 * @param {boolean} [opts.notifyUpdates=false] - Whether to send updates when data changes.
 * @returns {object} - An object with a check method to perform the test.
 */
const createAlert = ({
  name,
  testCb,
  messageCb,
  notifyOnRecover = true,
  notifyUpdates = false,
}) => {
  let notified = false;
  let lastData = null;

  /**
   * Log and send the notification message.
   *
   * @param {string} msg - The message to notify.
   * @param {boolean} isSuccess - Whether the notification is a success message.
   * @param {boolean} isError - Whether the notification is an error in testing.
   * @param {boolean} isUpdate - Whether the notification is an update.
   * @returns {Promise<void>}
   */
  const notify = (msg, isSuccess, isError, isUpdate) => {
    if (isError) {
      log.error(`Alert "${name}" test failed: ${msg}`);
      return ses.notify(msg);
    }

    let state = 'open';
    if (isSuccess) state = 'closed';
    if (isUpdate) state = 'updated';

    const finalMsg = `Alert "${name}" ${state}: ${msg}`;
    log.warn(finalMsg);
    return ses.notify(finalMsg);
  };

  /**
   * Update the last data snapshot.
   *
   * @param {any} data - The data to store.
   */
  const updateLastData = (data) => {
    lastData = data ? JSON.parse(JSON.stringify(data)) : null;
  };

  return {
    /**
     * Check the condition and notify if necessary.
     *
     * @returns {Promise<void>}
     */
    test: async () => {
      try {
        const data = await testCb() || null;

        if (!data) {
          // Still good
          if (!notified) {
            updateLastData(data);
            return;
          }

          // Now recovered
          notified = false;
          if (notifyOnRecover) await notify(messageCb(data), true);
          updateLastData(data);
          return;
        }

        // Now failed
        if (!notified) {
          notified = true;
          await notify(messageCb(data));
          updateLastData(data);
          return;
        }

        if (notifyUpdates && JSON.stringify(data) !== JSON.stringify(lastData)) {
          // An update?
          await notify(messageCb(data), false, false, true);
          updateLastData(data);
        }
      } catch (e) {
        console.log(e);

        await notify(e.stack || e.message, false, true);
      }
    },
  };
};

module.exports = {
  createAlert,
};
