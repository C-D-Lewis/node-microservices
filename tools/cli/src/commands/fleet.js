const printTable = require('../functions/printTable');
const { send } = require('./conduit');

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
  };
  const json = await send({ packet, host });

  // Display the fleet
  const fleetList = json.message.value;
  printTable(
    ['Name', 'Last checkin', 'Public IP', 'Local IP'],
    fleetList.map((p) => ([p.deviceName, p.lastCheckInDate, p.publicIp, p.localIp])),
  );
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
