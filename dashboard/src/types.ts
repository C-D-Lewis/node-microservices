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
  diskSize: string;
  diskUsage: number;
};

/** Graph data point. */
export type DataPoint = {
  value: number;
  dateTime: string;
};

/** Raw metric point */
export type MetricPoint = [number, number | string[]];

/** monitor plugin configuration */
export type MonitorPlugin = {
  FILE_NAME: string;
  EVERY?: number;
  AT?: string;
  ENABLED?: boolean;
};

/** App pages */
type Pages = 'FleetPage' | 'AppsPage';

/** App state type */
export type AppState = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;

  // App data
  token: string;
  deviceApps: Record<string, DeviceApp[]>;
  fleet: Device[];
  metricHistory: MetricPoint[];

  // Selections
  page: Pages,
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
    plugins: MonitorPlugin[];
    minValue: number;
    maxValue: number;
    minTime: number;
    maxTime: number;
    type: 'array' | 'number';
  };
};

/** Fake type for WebSocket message event */
export type WSMessageEvent = {
  data: {
    text: () => Promise<string>,
  },
};

/** Request states */
export type RequestState = 'pending' | 'success' | 'error';
