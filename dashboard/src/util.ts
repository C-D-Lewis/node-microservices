import { Fabricate, FabricateComponent } from 'fabricate.js';
import {
  AppState, Device, DeviceApp,
} from './types.ts';
import { sendConduitPacket } from './services/conduitService.ts';

declare const fabricate: Fabricate<AppState>;

/**
 * Parse query params.
 */
export const parseParams = () => {
  const params = new URLSearchParams(window.location.search);
  const token = params.get('token');
  const consoleEnabled = params.get('console') === 'true';
  if (!token) {
    alert('Please provide token param');
    return;
  }

  fabricate.update({ token, consoleEnabled });
};

/**
 * Sort devices by deviceName.
 *
 * @param {Device} a - Device to compare.
 * @param {Device} b - Device to compare.
 * @returns {number} Sort ordering.
 */
export const sortDeviceByName = (a: Device, b: Device) => (a.deviceName > b.deviceName ? 1 : -1);

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

  return `${minsAgo} min${minsAgo < 2 ? '' : 's'}`;
};

/**
 * Send a device command by URL.
 *
 * @param {HTMLElement} el - This element.
 * @param {object} state - Current state.
 * @param {object} device - Device to command.
 * @param {string} topic - Command topic, either 'reboot' or 'shutdown'.
 */
export const commandDevice = async (
  el: FabricateComponent<AppState>,
  state: AppState,
  device: Device,
  topic: string,
) => {
  const { deviceName } = device;
  const stateKey = fabricate.buildKey('command', topic);
  const pressed = !!state[stateKey];

  // Reset color regardless
  setTimeout(() => {
    el.setStyles(({ palette }) => ({ backgroundColor: palette.grey3 }));
    fabricate.update(stateKey, false);
  }, 2000);

  el.setStyles({ backgroundColor: !pressed ? 'red' : '#0003' });
  fabricate.update(stateKey, !pressed);
  if (!pressed) return;

  try {
    const { error } = await sendConduitPacket(state, { to: 'conduit', topic }, deviceName);
    if (error) throw new Error(error);

    console.log(`Device ${deviceName} sent ${topic} command`);
    el.setStyles(({ palette }) => ({ backgroundColor: palette.statusOk }));
  } catch (e) {
    alert(e);
    console.log(e);
  }
};

/**
 * Sort apps by name.
 *
 * @param {Device} a - Device to compare.
 * @param {Device} b - Device to compare.
 * @returns {number} Sort ordering.
 */
export const sortAppByName = (a: DeviceApp, b: DeviceApp) => (a.app! > b.app! ? 1 : -1);

/**
 * Shorter representation of a date time.
 *
 * @param {number} timestamp - Input time.
 * @returns {string} Short date time.
 */
export const shortDateTime = (timestamp: string) => {
  const [, time] = new Date(timestamp).toISOString().split('T');
  const shortTime = time.split(':').slice(0, 2).join(':');
  return `${shortTime}`;
};

/**
 * Get today's date as a string in YYYY-MM-DD format.
 *
 * @returns {string} Today's date string.
 */
export const getTodayDateString = () => new Date().toISOString().split('T')[0];
