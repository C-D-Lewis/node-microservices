const { hostname } = require('os');
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
          required: ['HOST', 'DEVICE_TYPE'],
          properties: {
            HOST: { type: 'string' },
            DEVICE_TYPE: {
              type: 'string',
              enum: ['pc', 'server', 'pi', 'other'],
            },
          },
        },
      },
    },
  },
});

/** Attic key for fleet list data */
const FLEET_LIST_KEY = 'fleetList';
/** Checking interval */
const CHECKIN_INTERVAL_MS = 1000 * 60 * 10;

const {
  /** Fleet config data */
  FLEET,
} = config.OPTIONS;

attic.setAppName('conduit');
attic.setHost(FLEET.HOST);

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
  try {
    const now = new Date();
    const updatePayload = {
      deviceName: hostname(),
      lastCheckIn: now.getTime(),
      lastCheckInDate: now.toISOString(),
      publicIp: await ip.getPublic(),
      localIp: await ip.getLocal(),
      deviceType: FLEET.DEVICE_TYPE,
    };

    const fleetList = await attic.get(FLEET_LIST_KEY);
    const found = fleetList.find((p) => p.deviceName === hostname());
    if (!found) {
      // Add a new entry
      fleetList.push(updatePayload);
    } else {
      // Update found extry in place
      Object.assign(found, updatePayload);
    }

    await attic.set(FLEET_LIST_KEY, fleetList.sort(sortByLastCheckIn));
    log.info(`Fleet list updated: ${JSON.stringify(updatePayload)}`);
  } catch (e) {
    log.error(`Failed to check in: ${e.stack}`);
  }
};

/**
 * Schedule checkins on a regular basis.
 */
const scheduleCheckins = async () => {
  // Create the remote list if it doesn't already exist
  if (!(await attic.exists(FLEET_LIST_KEY))) {
    await attic.set(FLEET_LIST_KEY, []);
  }

  await checkIn();
  setInterval(checkIn, CHECKIN_INTERVAL_MS);
};

module.exports = {
  scheduleCheckins,
};
