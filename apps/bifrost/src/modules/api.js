const { bifrost } = require('../node-common')(['bifrost']);

/** Schema for messages setting a value */
const CHECKIN_MESSAGE_SCHEMA = {
  required: ['deviceName', 'lastCheckIn', 'lastCheckInDate', 'publicIp', 'localIp', 'deviceType'],
  properties: {
    deviceName: { type: 'string' },
    lastCheckIn: { type: 'number' },
    lastCheckInDate: { type: 'string' },
    publicIp: { type: 'string' },
    localIp: { type: 'string' },
    deviceType: { type: 'string' },
  },
};

/**
 * Setup Conduit topic handlers.
 */
const setup = async () => {
  // await connectToHostServer();

  bifrost.registerTopic('checkIn', require('../api/checkIn'), CHECKIN_MESSAGE_SCHEMA);
};

module.exports = { setup };
