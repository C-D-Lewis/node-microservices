/** Type of IP */
export type IPType = 'public' | 'local';

/** Device apps data */
export type DeviceApp = {
  app?: string;
  status?: string;
  port?: number;
  error?: string;
};

/** Conduit packet type */
export type Packet = {
  to: string;
  from?: string;
  topic: string;
  message?: object;
};

/** Device type */
export type Device = {
  deviceName: string;
  localIp: string;
  publicIp: string;
  commit: string;
  commitDate: string;
  lastCheckIn: number;
  deviceType: 'other' | 'pc' | 'pi' | 'other';
};

/** Graph data point. */
export type DataPoint = {
  value: number;
  dateTime: string;
};

/** Raw metric point */
export type MetricPoint = [number, number];

/** monitor plugin configuration */
export type MonitorPlugin = {
  FILE_NAME: string;
  EVERY?: number;
  AT?: string;
  ENABLED?: boolean;
};

/** App state type */
export type AppState = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;

  // App data
  token: string;
  host: string;
  deviceApps: Record<string, DeviceApp[]>;
  fleet: Device[];
  logEntries: string[];
  logExpanded: boolean;

  // Selections
  page: 'FleetPage' | 'AppsPage',
  selectedDevice: Device | null,

  // App data
  atticData: {
    app: string;
    key: string;
    value: string;
  };
  conduitData: {
    app: string;
    topic: string;
    message: string;
  };
  visualsData: {
    index: number;
    red: number;
    green: number;
    blue: number;
    text: string;
  };
  guestlistData: {
    adminPassword: string;
    name: string;
    apps: string;
    topics: string;
  };
  clacksData: {
    topic: string;
    message: string;
    connected: boolean;
  };
  monitorData: {
    metricNames: string[];
    metric: string;
    metricHistory: MetricPoint[];
    plugins: MonitorPlugin[];
    minValue: number;
    maxValue: number;
    minTime: number;
    maxTime: number;
  };
};

/** Fake type for WebSocket message event */
export type WSMessageEvent = {
  data: {
    text: () => Promise<string>,
  },
};
