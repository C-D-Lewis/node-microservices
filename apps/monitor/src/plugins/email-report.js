const { readFileSync } = require('fs');
const { log, ses, wait } = require('../node-common')(['log', 'ses', 'wait']);

const { HOME } = process.env;

/** Log name */
const LOG_NAME = 'crontab.log';
/** Wait time */
const WAIT_MS = 30000;

/**
 * Send email for launch log.
 */
module.exports = async () => {
  await wait(WAIT_MS);

  try {
    const text = readFileSync(`${HOME}/${LOG_NAME}`, 'utf-8').toString();
    await ses.notify(text, 'Launch Report');
    log.info(`Sent log ${LOG_NAME} as email`);
  } catch (e) {
    log.error(e);
  }
};
