const fetch = require('node-fetch').default;

const {
  /** Token required for the host, if any */
  CONDUIT_TOKEN = undefined,
} = process.env;

/** Default conduit port */
const CONDUIT_PORT = 5959;

/**
 * Send a packet.
 * TODO: Support --host flag to override host
 *
 * @param {object} opts - Options.
 * @param {object} opts.packet - Packet to send.
 * @param {string} opts.host - Host to use.
 */
const send = async ({ packet, host = 'localhost' }) => {
  const res = await fetch(`http://${host}:${CONDUIT_PORT}/conduit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...packet,
      auth: packet.auth || CONDUIT_TOKEN,
    }),
  });
  const json = await res.json();
  return json;
};

module.exports = {
  firstArg: 'conduit',
  description: 'Work with the conduit app.',
  operations: {
    sendPacket: {
      /**
       * Send a conduit packet.
       *
       * @param {Array<string>} args - Command args
       * @returns {Promise<void>}
       */
      execute: async ([, to, topic, messageJson]) => {
        const res = await send({ to, topic, message: JSON.parse(messageJson) });
        console.log(res);
      },
      pattern: 'send $to $topic $message',
    },
  },
  send,
};
