import { Fabricate } from 'fabricate.js';
import { AppState, Device } from './types';
import { CONDUIT_PORT, FLEET_HOST } from './constants';

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
