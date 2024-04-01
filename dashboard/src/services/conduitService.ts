import { Fabricate } from 'fabricate.js';
import { CONDUIT_PORT, FLEET_HOST } from '../constants';
import { AppState, Packet } from '../types';
import { appRequestStateKey, isReachableKey } from '../utils';

declare const fabricate: Fabricate<AppState>;

/**
 * Send a conduit packet.
 *
 * @param {AppState} state - App state.
 * @param {Packet} packet - Packet to send.
 * @param {string} deviceNameOverride - Override device name.
 * @param {string} [tokenOverride] - Override auth token sent.
 * @returns {Promise<object>} Response.
 * @throws {Error} Any error encountered.
 */
// eslint-disable-next-line import/prefer-default-export
export const sendConduitPacket = async (
  state: AppState,
  packet: Packet,
  deviceNameOverride?: string,
  tokenOverride?: string,
) => {
  const { token, selectedDevice, fleet } = state;
  const reqStateKey = appRequestStateKey(packet.to);
  fabricate.update(reqStateKey, 'pending');

  try {
    // Begin with host unless some device is selected to drill down
    let destination = FLEET_HOST;

    const finalDevice = deviceNameOverride
      ? fleet.find(({ deviceName }) => deviceName === deviceNameOverride)!
      : selectedDevice;
    if (!finalDevice) throw new Error('Unable to identify device to send message to.');

    const { localIp, publicIp, deviceName } = finalDevice;
    const isLocalReachable = state[isReachableKey(deviceName, 'local')];

    // Destination is local if reachable, else forward local via public
    destination = isLocalReachable ? localIp : publicIp;
    const forwardHost = destination === publicIp ? localIp : undefined;
    console.log(`${finalDevice?.deviceName} >>> ${JSON.stringify(packet)}`);

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
    console.log(`<<< ${finalDevice?.deviceName} ${JSON.stringify(json)}`);

    fabricate.update(reqStateKey, 'success');
    return json;
  } catch (error) {
    console.log(error);
    fabricate.update(reqStateKey, 'error');
    throw error;
  }
};
