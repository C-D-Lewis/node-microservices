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
          required: ['DEVICE_NAME', 'HOST', 'PORT'],
          properties: {
            DEVICE_NAME: { type: 'string' },
            HOST: { type: 'string' },
            PORT: { type: 'number' },
          },
        },
      },
    },
  },
});

const FLEET_LIST_KEY = 'fleetList';
const { FLEET } = config.OPTIONS;

const init = () => {
  attic.setAppName('conduit');
  attic.setHost(FLEET.HOST);
};

const sortByLastCheckIn = (a, b) => a.lastCheckIn > b.lastCheckIn ? -1 : 1;

const checkIn = async () => {
  if (!await attic.exists(FLEET_LIST_KEY)) {
    await attic.set(FLEET_LIST_KEY, []);
  };

  const now = new Date();
  const update = {
    deviceName: FLEET.DEVICE_NAME,
    lastCheckIn: now.getTime(),
    lastCheckInDate: now.toISOString(),
    publicIp: await ip.getPublic(),
    localIp: await ip.getLocal(),
  };

  const fleet = await attic.get(FLEET_LIST_KEY);
  const found = fleet.find(p => p.deviceName === FLEET.DEVICE_NAME);
  if (!found) {
    fleet.push(update);
  } else {
    Object.assign(found, update);
  }
  await attic.set(FLEET_LIST_KEY, fleet.sort(sortByLastCheckIn));
  log.info(`Fleet list updated: ${JSON.stringify(update)}`);
};

init();

module.exports = {
  checkIn,
};
