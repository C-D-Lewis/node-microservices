const ConduitService = {};

/**
 * Send a conduit packet.
 *
 * @param {object} state - App state.
 * @param {object} packet - Packet to send.
 * @param {string} [tokenOverride] - Override auth token sent.
 * @param {string} [deviceOverride] - Override selectedDevice.
 * @returns {Promise<object>} Response.
 * @throws {Error} Any error encountered.
 */
ConduitService.sendPacket = async (state, packet, tokenOverride, deviceOverride) => {
  console.log('Sending...');

  const { token, selectedDevice, fleet } = state;

  try {
    // Begin with host unless some device is selected to drill down
    let destination = state.host;
    let forwardHost;

    const finalDevice = deviceOverride
      ? fleet.find(({ deviceName }) => deviceName === deviceOverride)
      : selectedDevice;
    if (finalDevice) {
      const { localIp, publicIp, deviceName } = finalDevice;
      const isLocalReachable = state[Utils.isReachableKey(deviceName, 'local')];

      // Destination is local if reachable, else forward local via public
      destination = isLocalReachable ? localIp : publicIp;
      forwardHost = destination === publicIp ? localIp : undefined;
    }

    const res = await fetch(`http://${destination}:${Constants.CONDUIT_PORT}/conduit`, {
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

    Utils.addLogEntry(state, json);
    return json;
  } catch (error) {
    console.log(error);
    throw error;
  }
};
