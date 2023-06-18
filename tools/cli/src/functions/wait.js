/**
 * Wait some time.
 *
 * @param {number} ms - Time to wait.
 * @returns {Promise}
 */
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

module.exports = wait;
