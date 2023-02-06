const { hostname } = require('os');
const {
  config, ip, log, bifrost,
} = require('../node-common')(['config', 'ip', 'log', 'bifrost']);

const { OPTIONS } = config.withSchema('fleet.js', {
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

/**
 * Sort item by lastCheckIn timestamp.
 *
 * @param {number} a - First item.
 * @param {number} b - Second item.
 * @returns {number} -1 to sort above, 1 to sort below.
 */
const sortByLastCheckIn = (a, b) => (a.lastCheckIn > b.lastCheckIn ? -1 : 1);

/**
 * Get data from attic on another device.
 *
 * @param {string} key - Key to use.
 * @returns {object} Response.
 */
const atticGet = (key) => bifrost.sendToOtherDevice(OPTIONS.FLEET.HOST, {
  to: 'attic',
  topic: 'get',
  message: {
    app: 'bifrost',
    key,
  },
});

/**
 * Send the data to remote Attic to perform the checkin.
 *
 * TODO: Can't use attic module until can be configured for sendToOtherDevice.
 */
const checkIn = async () => {
  try {
    // Create the remote list if it doesn't already exist
    const existing = await atticGet(FLEET_LIST_KEY);
    console.log(existing);

    const now = new Date();
    const updatePayload = {
      deviceName: hostname(),
      lastCheckIn: now.getTime(),
      lastCheckInDate: now.toISOString(),
      publicIp: await ip.getPublic(),
      localIp: await ip.getLocal(),
      deviceType: OPTIONS.FLEET.DEVICE_TYPE,
    };

    const fleetList = await attic.get(FLEET_LIST_KEY);
    const me = fleetList.find((p) => p.deviceName === hostname());
    if (!me) {
      // Add a new entry
      fleetList.push(updatePayload);
    } else {
      // Update me in place
      Object.assign(me, updatePayload);
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
  setInterval(checkIn, CHECKIN_INTERVAL_MS);

  // First checkin now
  await checkIn();
};

module.exports = {
  scheduleCheckins,
};
