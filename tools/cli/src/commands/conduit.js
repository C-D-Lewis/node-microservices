const fetch = require('node-fetch').default;

/** Default conduit port */
const CONDUIT_PORT = 5959;

/**
 * Send a packet.
 * TODO: Support --host flag to override host
 *
 * @param {string} to - App to send to.
 * @param {string} topic - Topic to use.
 * @param {object} message - Message to use.
 */
const send = async (to, topic, message) => {
  const packet = { to, topic, message: JSON.parse(message) };
  const res = await fetch(`http://localhost:${CONDUIT_PORT}/conduit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(packet),
  });
  const json = await res.json();
  console.log(json);
};

module.exports = {
  firstArg: 'conduit',
  description: 'Work with conduit features.',
  operations: {
    sendPacket: {
      /**
       * Send a conduit packet.
       *
       * @param {Array<string>} args - Command args
       * @returns {Promise<void>}
       */
      execute: async ([, to, topic, message]) => send(to, topic, message),
      pattern: 'send $to $topic $message',
    },
  },
};
