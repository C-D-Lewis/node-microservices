import { CONDUIT_PORT } from "../constants";
import { AppState, Packet } from "../types";
import { addLogEntry, isReachableKey } from "../utils";

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
export const sendConduitPacket = async (
  state: AppState,
  packet: Packet,
  tokenOverride?: string,
  deviceNameOverride?: string,
) => {
  console.log('Sending...');

  const { token, selectedDevice, fleet } = state;

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
    console.log(JSON.stringify(json));

    addLogEntry(state, json);
    return json;
  } catch (error) {
    console.log(error);
    throw error;
  }
};
