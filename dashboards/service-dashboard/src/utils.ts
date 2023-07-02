import { AppState, IPType, DeviceApp } from './types';
import { Fabricate } from '../node_modules/fabricate.js/types/fabricate';
import { sendConduitPacket } from './services/conduitService';

declare const fabricate: Fabricate<AppState>;

/**
 * Create state key for if a device's IP type is reachable.
 *
 * @param {string} deviceName - Device name.
 * @param {string} type - public or local
 * @returns {string} Key
 */
export const isReachableKey = (deviceName: string, type: IPType) => `isReachable:${deviceName}:${type}`;

/**
 * Get the best reachable IP for the selected device.
 *
 * @param {AppState} state - App state.
 * @returns {string|undefined} Preferred IP to use.
 */
export const getReachableIp = (state: AppState) => {
  const { selectedDevice } = state;
  if (!selectedDevice) throw new Error('No selectedDevice yet');

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
 * Add a log entry.
 *
 * @param {AppState} state - App state.
 * @param {string|object} content - New item content.
 */
export const addLogEntry = (state: AppState, content: string|object) => {
  const text = (typeof content === 'string' ? content : JSON.stringify(content, null, 2)).slice(0, 10000);
  const logEntries = [
    ...state.logEntries,
    text,
  ];
  fabricate.update({ logEntries });
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
      const { message: apps } = await sendConduitPacket(
        state,
        { to: 'conduit', topic: 'getApps' },
        undefined,
        deviceName,
      );

      result[deviceName] = apps;
      fabricate.update('deviceApps', result);
    } catch (err: any) {
      console.error(err);
      result[deviceName] = { error: err.message };
    }
  });

  await Promise.all(promises);
};