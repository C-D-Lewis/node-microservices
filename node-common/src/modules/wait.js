/**
 * Wait a number of milliseconds.
 *
 * @param {number} ms - Milliseconds to wait.
 * @returns {Promise}
 */
module.exports = ms => new Promise(res => setTimeout(res, ms));
