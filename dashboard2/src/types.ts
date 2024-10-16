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
  timestamp: number;
  dateTime: string;
};

/** Available graphed metrics */
export type MetricName = 'cpu' | 'memoryPerc' | 'tempRaw';

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

/** App state type */
export type AppState = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;

  // App data
  token: string;

  // Loaded data
  selectedDeviceApps: DeviceApp[];
  devices: Device[];

  // Selections
  selectedDevice: Device | null,
};

/** Request states */
export type RequestState = 'pending' | 'success' | 'error';
