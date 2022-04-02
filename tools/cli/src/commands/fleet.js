const fetch = require('node-fetch').default;
const printTable = require('../functions/printTable');

/** Default conduit port */
const CONDUIT_PORT = 5959;

const {
  /** Token required for the host, if any */
  CONDUIT_TOKEN,
} = process.env;

/**
 * Fetch and display fleet members.
 * TODO: Support --host flag to override host
 *
 * @param {string} host - Host to use.
 */
const list = async (host) => {
  const packet = {
    to: 'attic',
    topic: 'get',
    message: {
      app: 'conduit',
      key: 'fleetList',
    },
    auth: CONDUIT_TOKEN || undefined,
  };
  const res = await fetch(`http://${host}:${CONDUIT_PORT}/conduit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(packet),
  });
  const json = await res.json();

  // Display the fleet
  const fleetList = json.message.value;
  const headers = ['Name', 'Last checkin', 'Public IP', 'Local IP'];
  const rows = fleetList.map((p) => ([
    p.deviceName,
    p.lastCheckInDate,
    p.publicIp,
    p.localIp,
  ]));
  printTable(headers, rows);
};

module.exports = {
  firstArg: 'fleet',
  description: 'Work with fleet features.',
  operations: {
    sendPacket: {
      /**
       * List fleet members from the 'mothership' host.
       *
       * @param {Array<string>} args - Command args.
       * @returns {Promise<void>}
       */
      execute: async ([host]) => list(host),
      pattern: '$host list',
    },
  },
};
