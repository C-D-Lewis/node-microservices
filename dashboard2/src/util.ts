import { Fabricate, FabricateComponent } from 'fabricate.js';
import { AppState, Device } from './types';
import { CONDUIT_PORT, FLEET_HOST } from './constants';
import { sendConduitPacket } from './services/conduitService';

declare const fabricate: Fabricate<AppState>;

/**
 * Re-load the fleet list data.
 *
 * @param {object} state - App state.
 */
export const fetchFleetList = async (state: AppState) => {
  const { token } = state;
  fabricate.update({ fleet: [] });

  try {
    // Can't use sendConduitPacket, not a device by name
    const res = await fetch(`http://${FLEET_HOST}:${CONDUIT_PORT}/conduit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: 'attic',
        topic: 'get',
        message: { app: 'conduit', key: 'fleetList' },
        auth: token || '',
      }),
    });
    const { message } = await res.json();
    fabricate.update({ fleet: message.value });
  } catch (err) {
    console.error(err);
    alert(err);
  }
};

/**
 * Parse query params.
 */
export const parseParams = () => {
  const params = new URLSearchParams(window.location.search);
  const token = params.get('token');
  if (!token) {
    alert('Please provide token param');
    return;
  }

  fabricate.update({ token });
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

  return `${minsAgo} mins`;
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
