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

/** App state type */
export type AppState = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;

  // App data
  token: string;
  deviceApps: Record<string, DeviceApp[]>;
  fleet: Device[];

  // Selections
  selectedDevice: Device | null,
};

/** Request states */
export type RequestState = 'pending' | 'success' | 'error';
