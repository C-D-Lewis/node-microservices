const printTable = require('../functions/printTable');
const switches = require('../modules/switches');
const { send } = require('./conduit');

/**
 * Fetch and display fleet members.
 */
const list = async () => {
  const token = switches.TOKEN;
  const packet = {
    to: 'attic',
    topic: 'get',
    message: {
      app: 'conduit',
      key: 'fleetList',
    },
    auth: token,
  };
  const json = await send({ packet });

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
       * @returns {Promise<void>}
       */
      execute: async () => list(),
      pattern: 'list',
    },
  },
};
