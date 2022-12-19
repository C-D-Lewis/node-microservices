const {
  /* Where the fleet list can be found. */
  FLEET_HOST = 'localhost',
} = window.Config;

const Constants = {};

/** Port to look for conduit apps */
Constants.CONDUIT_PORT = 5959;

/** App card width */
Constants.APP_CARD_WIDTH = 375;

/** Initial total app state */
Constants.INITIAL_STATE = {
  page: 'FleetPage',
  apps: [],
  fleetList: [],
  selectedIp: FLEET_HOST,
  selectedDeviceName: undefined,
  logEntries: ['Ready'],
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
  guestlistData: {
    adminPassword: '',
    name: '',
    apps: '',
    topics: '',
  },
  clacksData: {
    topic: '',
    message: '{}',
  },
  monitorData: {
    metricNames: [],
    metric: '',
    metricHistory: [],
  },
};

/** Icon type names */
Constants.ICON_NAMES = {
  other: 'other',
  pc: 'pc',
  pi: 'raspberrypi',
  server: 'server-white',
};
