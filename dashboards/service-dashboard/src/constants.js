const {
  /* Where the fleet list can be found. */
  FLEET_HOST = 'localhost',
} = window.config;

/** Port to look for conduit apps */
// eslint-disable-next-line no-unused-vars
const CONDUIT_PORT = 5959;

/** Initial total app state */
// eslint-disable-next-line no-unused-vars
const INITIAL_STATE = {
  apps: [],
  fleetList: [],
  ip: FLEET_HOST,
  responseBarText: 'Ready',
  atticData: {
    app: '',
    key: '',
    value: '',
  },
  conduitData: {
    app: '',
    topic: 'status',
    message: '{}',
  },
  visualsData: {
    index: 0,
    red: 128,
    green: 128,
    blue: 128,
    text: '',
  },
  page: 'fleetPage',
};

/** Icon type names */
const ICON_NAMES = {
  other: 'other',
  pc: 'pc',
  pi: 'raspberrypi',
  server: 'server-white',
};
