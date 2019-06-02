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
          required: ['DEVICE_NAME', 'CENTRAL_URL', 'PORT'],
          properties: {
            DEVICE_NAME: { type: 'string' },
            CENTRAL_URL: { type: 'string' },
            PORT: { type: 'number' },
          },
        },
      },
    },
  },
});

const FLEET_LIST_KEY = 'conduit:fleet:list';

const checkIn = async () => {
  const { FLEET } = config.OPTIONS;

  if (!await attic.exists(FLEET_LIST_KEY)) {
    await attic.set(FLEET_LIST_KEY, {});
  };

  const fleet = await attic.get(FLEET_LIST_KEY);
  fleet[FLEET.DEVICE_NAME] = {
    lastCheckIn: Date.now(),
    localIp: await ip.get(),
  };
  await attic.set(FLEET_LIST_KEY, fleet);
};

const init = () => {
  attic.setHost(config.OPTIONS.FLEET.DEVICE_NAME);
};

init();

module.exports = {
  checkIn,
};
