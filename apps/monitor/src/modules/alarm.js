const { log, ses, attic } = require('../node-common')(['log', 'ses', 'attic']);

/** Attic key for alarms state data */
const ATTIC_KEY_ALARMS = 'alarms';

/**
 * Store alarm state for reporting in the dashboard.
 *
 * @param {string} name - Name of the alarm.
 * @param {string} status - Current status of the alarm ('open', 'closed', 'updated').
 * @param {string} lastMessage - Last message associated with the alarm.
 * @returns {Promise<void>}
 */
const updateAlarmState = async (name, status, lastMessage) => {
  log.debug(`Updating alarm state: ${JSON.stringify({ name, status, lastMessage })}`);
  if (!await attic.exists(ATTIC_KEY_ALARMS)) await attic.set(ATTIC_KEY_ALARMS, {});

  const alarms = await attic.get(ATTIC_KEY_ALARMS);
  alarms[name] = {
    status,
    lastMessage,
    lastUpdated: new Date().toISOString(),
  };
  await attic.set(ATTIC_KEY_ALARMS, alarms);
};

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
 * @param {boolean} [opts.sendEmails=true] - Whether to send email notifications.
 * @returns {object} - An object with a check method to perform the test.
 */
const createAlarm = ({
  name,
  testCb,
  messageCb,
  notifyOnRecover = true,
  notifyUpdates = false,
  sendEmails = process.env.ALARMS_DISABLED !== 'true',
}) => {
  let notified = false;
  let lastData = null;
  let lastMessage = '';
  let lastStatus = 'closed';

  /**
   * Log and send the notification message.
   * It should not modify alarm state.
   *
   * @param {boolean} [isError=false] - Whether this is an error notification.
   * @returns {Promise<void>}
   */
  const notify = async (isError) => {
    if (isError) {
      const failStr = `Alarm "${name}" test failed: ${lastMessage}`;
      log.error(failStr);
      return ses.notify(failStr);
    }

    const emailStr = `Alarm "${name}" ${lastStatus}: ${lastMessage}`;
    log.warn(emailStr);
    return sendEmails ? ses.notify(emailStr) : Promise.resolve();
  };

  /**
   * Update the last data snapshot.
   *
   * @param {any} data - The data to store.
   */
  const updateAlarm = async (data) => {
    // This must be done after any update comparison
    lastData = data ? JSON.parse(JSON.stringify(data)) : null;

    await updateAlarmState(name, lastStatus, lastMessage);
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
            lastStatus = 'closed';
            lastMessage = '';
            await updateAlarm(data);
            return;
          }

          // Now recovered
          notified = false;
          lastStatus = 'closed';
          lastMessage = messageCb(data);
          if (notifyOnRecover) await notify();
          await updateAlarm(data);
          return;
        }

        // Now failed
        if (!notified) {
          notified = true;
          lastStatus = 'open';
          lastMessage = messageCb(data);
          await notify();
          await updateAlarm(data);
          return;
        }

        if (JSON.stringify(data) !== JSON.stringify(lastData)) {
          // An update?
          lastStatus = 'open';
          lastMessage = messageCb(data);
          if (notifyUpdates) await notify();
          await updateAlarm(data);
        }
      } catch (e) {
        console.log(e);

        // Set notified so we don't keep spamming on errors
        notified = true;
        lastStatus = 'open';
        lastMessage = e.stack || e.message || String(e);
        await notify(true);
        await updateAlarm();
      }
    },
  };
};

module.exports = {
  createAlarm,
};
