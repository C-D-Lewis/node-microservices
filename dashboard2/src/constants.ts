import { AppState } from './types';

/** Fleet host URL */
export const FLEET_HOST = 'polaris.chrislewis.me.uk';

/** Port to look for conduit apps */
export const CONDUIT_PORT = 5959;

/** Initial total app state */
export const INITIAL_STATE: AppState = {
  // App data
  token: '',

  // Loaded data
  selectedDeviceApps: [],
  devices: [],
  metricNames: [],

  // Selections
  selectedDevice: null,
};

/** Icon type names */
export const ICON_NAMES: Record<string, string> = {
  other: 'other',
  pc: 'pc',
  pi: 'raspberrypi',
  server: 'server-white',
};

/** Navbar height from fabricate.js */
export const NAVBAR_HEIGHT = 40;

/** Metric bucket size */
export const BUCKET_SIZE = 5;
