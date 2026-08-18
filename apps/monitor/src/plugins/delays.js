const {
  log, s3,
} = require('../node-common')(['log', 's3']);
const { createAlarm } = require('../modules/alarm');
const { getNrIncidents, getTflIncidents } = require('../modules/delays');

/** Hours to alarm */
const HOURS = [6, 23];

let nrAlarm;
let tflAlarm;

/**
 * Check rail services for delays.
 */
module.exports = async () => {
  // If not during hours, skip
  const hour = new Date().getHours();
  const [start, end] = HOURS;
  if (hour < start || hour > end) {
    log.debug(`Not in active hours, skipping: ${hour}`);
    return;
  }

  if (nrAlarm && tflAlarm) {
    await nrAlarm.test();
    await tflAlarm.test();
    return;
  }

  nrAlarm = createAlarm({
    name: 'delaysNr',
    notifyOnRecover: false,
    /**
     * Test callback.
     */
    testCb: async () => {
      const incidents = await getNrIncidents();
      log.debug(JSON.stringify({ incidents }, null, 2));

      let text = '';
      if (incidents.length) {
        text += `Rail:\n${incidents.join('\n')}\n`;
      }

      try {
        await s3.putObject('public-files.chrislewis.me.uk', 'data/delaysNr.json', JSON.stringify({ incidents }, null, 2));
      } catch (e) {
        console.log('Error putting s3 for delaysNr');
        console.log(e);
      }

      return incidents.length > 0 ? text : undefined;
    },
    /**
     * Message callback.
     *
     * @param {string} text - Text, if any.
     * @returns {string} Message.
     */
    messageCb: (text) => (text
      ? `National Rail incidents!\n\n${text}`
      : 'No configured lines have incidents reported.'),
  });

  tflAlarm = createAlarm({
    name: 'delaysTfl',
    notifyOnRecover: false,
    /**
     * Test callback.
     */
    testCb: async () => {
      const incidents = await getTflIncidents();
      log.debug(JSON.stringify({ incidents }, null, 2));

      let text = '';
      if (incidents.length) {
        text += `TfL:\n${incidents.join('\n')}\n`;
      }

      try {
        await s3.putObject('public-files.chrislewis.me.uk', 'data/delaysTfl.json', JSON.stringify({ incidents }, null, 2));
      } catch (e) {
        console.log('Error putting s3 for delaysTfl');
        console.log(e);
      }

      return incidents.length > 0 ? text : undefined;
    },
    /**
     * Message callback.
     *
     * @param {string} text - Text, if any.
     * @returns {string} Message.
     */
    messageCb: (text) => (text
      ? `TfL incidents!\n\n${text}`
      : 'No configured lines have incidents reported.'),
  });

  await nrAlarm.test();
  await tflAlarm.test();
};
