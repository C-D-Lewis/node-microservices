const {
  config, attic, ip,
} = require('../node-common')(['config', 'attic', 'ip']);

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

const checkIn = async () => {
  const { FLEET } = config.OPTIONS;

  if (!await attic.exists(FLEET_LIST_KEY)) {
    await attic.set(FLEET_LIST_KEY, {});
  };

  const fleet = await attic.get(FLEET_LIST_KEY);
  fleet[FLEET.DEVICE_NAME] = {
    lastCheckIn: Date.now(),
    publicIp: await ip.getPublic(),
    localIp: await ip.getLocal(),
  };
  await attic.set(FLEET_LIST_KEY, fleet);
};

const init = () => {
  attic.setAppName('conduit');
  attic.setHost(config.OPTIONS.FLEET.HOST);
};

init();

module.exports = {
  checkIn,
};
