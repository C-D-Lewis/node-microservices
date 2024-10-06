import { CONDUIT_PORT } from '../constants';
import { AppState, Packet } from '../types';

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
  // const reqStateKey = appRequestStateKey(packet.to);
  // fabricate.update(reqStateKey, 'pending');

  try {
    const finalDevice = deviceNameOverride
      ? fleet.find(({ deviceName }) => deviceName === deviceNameOverride)!
      : selectedDevice;
    if (!finalDevice) throw new Error('Unable to identify device to send message to.');

    const { localIp, publicIp } = finalDevice;

    // Destination is local if reachable, else forward local via public
    console.log(`${finalDevice?.deviceName} >>> ${JSON.stringify(packet)}`);

    const res = await fetch(`http://${publicIp}:${CONDUIT_PORT}/conduit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...packet,
        auth: tokenOverride || token || '',
        host: localIp,
        device: finalDevice && finalDevice.deviceName,
      }),
    });
    const json = await res.json();
    console.log(`<<< ${finalDevice?.deviceName} ${JSON.stringify(json)}`);

    // fabricate.update(reqStateKey, 'success');
    return json;
  } catch (error) {
    console.log(error);
    // fabricate.update(reqStateKey, 'error');
    throw error;
  }
};
