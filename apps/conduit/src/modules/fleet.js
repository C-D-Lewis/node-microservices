const {
  config, attic, ip, log,
} = require('../node-common')(['config', 'attic', 'ip', 'log']);

config.requireKeys('fleet.js', {
  required: ['OPTIONS'],
  properties: {
    OPTIONS: {
      required: ['FLEET'],
      properties: {
        FLEET: {
          required: ['DEVICE_NAME', 'HOST'],
          properties: {
            DEVICE_NAME: { type: 'string' },
            HOST: { type: 'string' },
          },
        },
      },
    },
  },
});

/** Attic key for fleet list data */
const FLEET_LIST_KEY = 'fleetList';

const {
  /** Fleet config data */
  FLEET,
} = config.OPTIONS;

/**
 * Init the attic module
 */
const initAtticModule = () => {
  attic.setAppName('conduit');
  attic.setHost(FLEET.HOST);
};

/**
 * Sort item by lastCheckIn timestamp.
 *
 * @param {number} a - First item.
 * @param {number} b - Second item.
 * @returns {number} -1 to sort above, 1 to sort below.
 */
const sortByLastCheckIn = (a, b) => (a.lastCheckIn > b.lastCheckIn ? -1 : 1);

/**
 * Send the data to remote Attic to perform the checkin.
 */
const checkIn = async () => {
  // Create the remote list if it doesn't already exist
  if (!(await attic.exists(FLEET_LIST_KEY))) {
    await attic.set(FLEET_LIST_KEY, []);
  }

  const now = new Date();
  const updatePayload = {
    deviceName: FLEET.DEVICE_NAME,
    lastCheckIn: now.getTime(),
    lastCheckInDate: now.toISOString(),
    publicIp: await ip.getPublic(),
    localIp: await ip.getLocal(),
  };

  const fleetList = await attic.get(FLEET_LIST_KEY);
  const found = fleetList.find((p) => p.deviceName === FLEET.DEVICE_NAME);
  if (!found) {
    // Add a new entry
    fleetList.push(updatePayload);
  } else {
    // Update found extry in place (TODO: avoid the 'else')
    Object.assign(found, updatePayload);
  }

  await attic.set(FLEET_LIST_KEY, fleetList.sort(sortByLastCheckIn));
  log.info(`Fleet list updated: ${JSON.stringify(updatePayload)}`);
};

initAtticModule();

module.exports = {
  checkIn,
};
