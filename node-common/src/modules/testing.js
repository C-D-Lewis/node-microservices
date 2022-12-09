const requestAsync = require('./requestAsync');

module.exports = {
  /**
   * Return after specified number of milliseconds.
   *
   * @param {number} ms - Number of milliseconds.
   * @returns {Promise} Promise that resolves when the time has elapsed.
   */
  sleepAsync: async (ms) => new Promise((resolve) => {
    setTimeout(resolve, ms);
  }),

  /**
   * Send a Conduit packet.
   *
   * @param {object} json - The packet to send.
   * @returns {Promise} Promise that resolves with the response.
   */
  sendConduitPacket: async (json) => requestAsync({
    url: 'http://localhost:5959/conduit',
    method: 'post',
    json,
  }).then(({ body }) => body),
};
