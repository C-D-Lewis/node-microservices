import { Fabricate } from 'fabricate.js';
import { CONDUIT_PORT } from '../constants';
import { AppState, Packet } from '../types';
import { appRequestStateKey, isReachableKey } from '../utils';

declare const fabricate: Fabricate<AppState>;

/**
 * Send a conduit packet.
 *
 * @param {AppState} state - App state.
 * @param {Packet} packet - Packet to send.
 * @param {string} [tokenOverride] - Override auth token sent.
 * @param {string} [deviceNameOverride] - Override selectedDevice.
 * @returns {Promise<object>} Response.
 * @throws {Error} Any error encountered.
 */
// eslint-disable-next-line import/prefer-default-export
export const sendConduitPacket = async (
  state: AppState,
  packet: Packet,
  tokenOverride?: string,
  deviceNameOverride?: string,
) => {
  console.log('================================ Sending ================================');
  console.table(JSON.stringify(packet));

  const { token, selectedDevice, fleet } = state;
  const reqStateKey = appRequestStateKey(packet.to);

  try {
    // Begin with host unless some device is selected to drill down
    let destination = state.host;
    let forwardHost;

    const finalDevice = deviceNameOverride
      ? fleet.find(({ deviceName }) => deviceName === deviceNameOverride)!
      : selectedDevice;
    if (finalDevice) {
      const { localIp, publicIp, deviceName } = finalDevice;
      const isLocalReachable = state[isReachableKey(deviceName, 'local')];

      // Destination is local if reachable, else forward local via public
      destination = isLocalReachable ? localIp : publicIp;
      forwardHost = destination === publicIp ? localIp : undefined;
    }

    fabricate.update(reqStateKey, 'pending');

    const res = await fetch(`http://${destination}:${CONDUIT_PORT}/conduit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...packet,
        auth: tokenOverride || token || '',
        host: forwardHost,
        device: finalDevice && finalDevice.deviceName,
      }),
    });
    const json = await res.json();
    console.log('================================ RECEIVED ================================');
    console.log(JSON.stringify(json));

    fabricate.update(reqStateKey, 'success');
    return json;
  } catch (error) {
    console.log(error);
    fabricate.update(reqStateKey, 'error');
    throw error;
  }
};
