import { Fabricate } from 'fabricate.js';
import { AppState, IPType, DeviceApp, Device, RequestState } from './types';
import { sendConduitPacket } from './services/conduitService';
import Theme from './theme';

declare const fabricate: Fabricate<AppState>;

/**
 * Create state key for if a device's IP type is reachable.
 *
 * @param {string} deviceName - Device name.
 * @param {string} type - public or local
 * @returns {string} Key
 */
export const isReachableKey = (deviceName: string, type: IPType) => fabricate.buildKey('isReachable', deviceName, type);

/**
 * Is app request state key.
 *
 * @param {string} app - App name.
 * @returns {string} Status color.
 */
export const appRequestStateKey = (app: string) => fabricate.buildKey('appRequestState', app);

/**
 * Get the best reachable IP for the selected device.
 *
 * @param {AppState} state - App state.
 * @returns {string|undefined} Preferred IP to use.
 */
export const getReachableIp = (state: AppState) => {
  const { selectedDevice } = state;
  if (selectedDevice === null) throw new Error('No selectedDevice yet');

  const { publicIp, localIp, deviceName } = selectedDevice;
  const publicIpValidKey = isReachableKey(deviceName, 'public');
  const localIpValidKey = isReachableKey(deviceName, 'local');
  if (state[localIpValidKey]) return localIp;

  return state[publicIpValidKey] ? publicIp : undefined;
};

/**
 * Get friendly string for time ago.
 *
 * @param {number} time - Time to use.
 * @returns {string} Friendly time ago.
 */
export const getTimeAgoStr = (time: number) => {
  const minsAgo = Math.round((Date.now() - time) / (1000 * 60));
  if (minsAgo > (60 * 24)) {
    return `${Math.round(minsAgo / (60 * 24))} days`;
  }

  if (minsAgo > 60) {
    return `${Math.round(minsAgo / 60)} hours`;
  }

  return `${minsAgo} mins`;
};

/**
 * Shorter representation of a date time.
 *
 * @param {number} timestamp - Input time.
 * @returns {string} Short date time.
 */
export const shortDateTime = (timestamp: string) => {
  const [date, time] = new Date(timestamp).toISOString().split('T');
  const shortTime = time.split(':').slice(0, 2).join(':');
  return `${date} ${shortTime}`;
};

/**
 * Load apps for all fleet devices.
 *
 * @param {AppState} state - App state.
 */
export const fetchApps = async (state: AppState) => {
  fabricate.update('deviceApps', []);

  const { fleet } = state;
  const result: Record<string, DeviceApp> = {};

  const promises = fleet.map(async (device) => {
    const { deviceName } = device;

    try {
      const { message } = await sendConduitPacket(
        state,
        { to: 'conduit', topic: 'getApps' },
        deviceName,
      );

      if (message && message.error) {
        console.error(message.error);
        result[deviceName] = { error: message.error };
      } else if (!message) {
        console.error('No response in fetchApps');
        result[deviceName] = { error: 'Error fetching apps' };
      } else {
        result[deviceName] = message;
      }

      fabricate.update('deviceApps', result);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error(err);
      result[deviceName] = { error: err.message };
    }
  });

  await Promise.all(promises);
};

/**
 * Sort devices by deviceName.
 *
 * @param {Device} a - Device to compare.
 * @param {Device} b - Device to compare.
 * @returns {number} Sort ordering.
 */
export const sortDeviceByName = (a: Device, b: Device) => a.deviceName > b.deviceName ? 1 : -1;

/**
 * Sort apps by name.
 *
 * @param {Device} a - Device to compare.
 * @param {Device} b - Device to compare.
 * @returns {number} Sort ordering.
 */
export const sortAppByName = (a: DeviceApp, b: DeviceApp) => a.app! > b.app! ? 1 : -1;

/**
 * Get status color for a given app.
 *
 * @param {AppState} state - App state.
 * @param {string} app - App name.
 * @returns {string} Status color.
 */
export const getAppStatusColor = (state: AppState, app: string): string => {
  const { selectedDevice, deviceApps } = state;
  if (selectedDevice === null) return 'pink';

  const { deviceName } = selectedDevice;
  const apps = deviceApps[deviceName];
  const { status } = apps.find((p) => p.app === app)!;
  return status?.includes('OK') ? Theme.palette.statusOk : Theme.palette.statusDown;
};

/**
 * Get color for request state.
 *
 * @param {RequestState} reqState - Request state.
 * @returns {string} Color
 */
export const getReqStateColor = (reqState: RequestState) => {
  if (reqState === 'success') return Theme.palette.statusOk;
  if (reqState === 'pending') return Theme.palette.statusPending;
  if (reqState === 'error') return Theme.palette.statusDown;
  return 'pink';
};
