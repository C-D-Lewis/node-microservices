const fetch = require('./fetch');

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
   * @param {object} packet - The packet to send.
   * @returns {Promise<object>} Promise that resolves with the response.
   */
  sendConduitPacket: async (packet) => fetch({
    url: 'http://localhost:5959/conduit',
    method: 'post',
    body: JSON.stringify(packet),
  }).then(({ data }) => data),
};
