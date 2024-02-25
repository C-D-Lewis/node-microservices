const fetch = require('node-fetch').default;
const switches = require('../modules/switches');

const {
  /** Token required for the host, if any */
  CONDUIT_TOKEN = undefined,
} = process.env;

/** Default conduit port */
const CONDUIT_PORT = 5959;

/**
 * Send a packet.
 *
 * @param {object} opts - Options.
 * @param {object} opts.packet - Packet to send.
 * @param {string} opts.host - Host to use, if override required.
 */
const send = async ({ packet, host }) => {
  const finalHost = host || switches.HOST || 'localhost';

  const res = await fetch(`http://${finalHost}:${CONDUIT_PORT}/conduit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...packet,
      auth: packet.auth || switches.TOKEN || CONDUIT_TOKEN,
    }),
  });
  console.log('end')
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
        const packet = { to, topic, message: JSON.parse(messageJson) };
        const res = await send({ packet });
        console.log(JSON.stringify(res, null, 2));
      },
      pattern: 'send $to $topic $message',
    },
  },
  send,
};
