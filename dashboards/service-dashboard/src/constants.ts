import { AppState } from './types';

/** Fleet host URL. TODO: Use env config */
const FLEET_HOST = 'polaris.chrislewis.me.uk';

/** Port to look for conduit apps */
export const CONDUIT_PORT = 5959;

/** App card width */
export const APP_CARD_WIDTH = 375;

/** Initial total app state */
export const INITIAL_STATE: AppState = {
  // App data
  token: '',
  host: FLEET_HOST,
  deviceApps: {},
  fleet: [],
  logEntries: [],
  logExpanded: false,
  metricHistory: [],

  // Selections
  page: 'FleetPage',
  selectedDevice: null,

  // App data
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
    connected: false,
  },
  monitorData: {
    metricNames: [],
    metric: '',
    plugins: [],
    minValue: 0,
    maxValue: 99999,
    minTime: 0,
    maxTime: 99999,
  },
};

/** Icon type names */
export const ICON_NAMES: Record<string, string> = {
  other: 'other',
  pc: 'pc',
  pi: 'raspberrypi',
  server: 'server-white',
};
