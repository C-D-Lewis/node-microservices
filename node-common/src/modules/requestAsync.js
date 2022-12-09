const request = require('request');

/**
 * Generic request function.
 *
 * FIXME: Replace with fetch
 *
 * @param {object} opts - Request options.
 * @returns {object} Request result.
 */
module.exports = (opts) => new Promise((resolve, reject) => {
  request(opts, (err, response, body) => {
    if (err) {
      reject(err);
      return;
    }

    resolve({ response, body });
  });
});
