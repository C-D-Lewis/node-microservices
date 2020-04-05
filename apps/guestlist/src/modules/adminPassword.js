const { existsSync, readFileSync } = require('fs');
const { log } = require('../node-common')(['log']);

/** Path to the password file to read. */
const PASSWORD_FILE = `${__dirname}/../../password`;
/** Interval between read attempts in milliseconds. */
const INTERVAL_MS = 5000;

let password;

/**
 * Read the password file from disk.
 * This authorizes all 'create' and 'delete' requests.
 */
const waitForFile = () => {
  if (!existsSync(PASSWORD_FILE)) {
    setTimeout(waitForFile, INTERVAL_MS);
    return;
  }

  password = readFileSync(PASSWORD_FILE, 'utf8').split('\n')[0].trim();
  log.info('Read password file');
};

/**
 * Return the read password, if any.
 *
 * @returns {string} password, if any read from disk.s
 */
const get = () => password;

module.exports = {
  waitForFile,
  get,
};
