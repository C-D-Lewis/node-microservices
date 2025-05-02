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
  uptimeDays?: number;
  caseColor?: string;
};

/** Graph data point. */
export type DataPoint = {
  value: number;
  timestamp: number;
  dateTime: string;
};

/** Raw metric point */
export type MetricPoint = [number, number];

/** Metric data */
export type MetricData = {
  buckets: DataPoint[];
  minTime: string;
  maxTime: string;
  minValue: number;
  maxValue: number;
};

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
  publicIp: string;
  consoleEnabled: boolean;

  // Loaded data
  selectedDeviceApps: DeviceApp[];
  devices: Device[];
  metricNames: string[];
  monitorPlugins: MonitorPlugin[];

  // State
  selectedDevice: Device | null,
  consoleOpen: boolean;
  consoleLogs: string[];
};

/** Request states */
export type RequestState = 'pending' | 'success' | 'error';
