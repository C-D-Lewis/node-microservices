const { execSync } = require('child_process');
const { hostname } = require('os');
const {
  config, attic, ip, log, os,
} = require('../node-common')(['config', 'attic', 'ip', 'log', 'os']);

config.addPartialSchema({
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
            MAIN_DISK_MOUNT: { type: 'string' },
          },
        },
      },
    },
  },
});

const { OPTIONS } = config.get(['OPTIONS']);

/** Attic key for fleet list data */
const FLEET_LIST_KEY = 'fleetList';
/** Checking interval */
const CHECKIN_INTERVAL_MS = 1000 * 60 * 10;

attic.setAppName('conduit');
attic.setHost(OPTIONS.FLEET.HOST);

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
    // Create the remote list if it doesn't already exist
    if (!(await attic.exists(FLEET_LIST_KEY))) await attic.set(FLEET_LIST_KEY, []);

    const now = new Date();
    const commit = execSync('git rev-parse --short HEAD').toString().trim();
    const commitDateStr = execSync('git log -1 --format=%ct').toString().trim();
    const commitDate = new Date(parseInt(`${commitDateStr}000`, 10)).toISOString();

    const disks = os.getDiskUsage();
    const mountPath = OPTIONS.FLEET.MAIN_DISK_MOUNT || '/';
    const mainDisk = disks.find((p) => p.path === mountPath);
    if (!mainDisk) throw new Error('Main disk not found');

    const { size: diskSize, usePerc: diskUsage } = mainDisk;

    const updatePayload = {
      deviceName: hostname(),
      lastCheckIn: now.getTime(),
      lastCheckInDate: now.toISOString(),
      publicIp: await ip.getPublic(),
      localIp: await ip.getLocal(),
      deviceType: OPTIONS.FLEET.DEVICE_TYPE,
      commit,
      commitDate,
      diskUsage,
      diskSize,
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
