const { hostname } = require('os');
const {
  config, ip, log, bifrost,
} = require('../node-common')(['config', 'ip', 'log', 'bifrost']);

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
          },
        },
      },
    },
  },
});

const { OPTIONS } = config.get(['OPTIONS']);

const { sendAndClose } = bifrost;

/** Checking interval */
const CHECKIN_INTERVAL_MS = 1000 * 60 * 10;

/**
 * Call bifrost checkin API for this device - should be only for the fleet host (not this device)
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
      deviceType: OPTIONS.FLEET.DEVICE_TYPE,
    };

    await sendAndClose(OPTIONS.FLEET.HOST, {
      to: 'bifrost',
      topic: 'checkIn',
      message: updatePayload,
    });
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
