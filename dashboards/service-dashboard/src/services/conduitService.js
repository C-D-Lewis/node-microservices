const ConduitService = {};

/**
 * Send a conduit packet.
 *
 * @param {object} state - App state.
 * @param {object} packet - Packet to send.
 * @param {string} [tokenOverride] - Override auth token sent.
 * @returns {Promise<object>} Response.
 * @throws {Error} Any error encountered.
 */
ConduitService.sendPacket = async (state, packet, tokenOverride) => {
  console.log('Sending...');

  const {
    token, selectedDeviceName, fleetList, selectedIp,
  } = state;

  try {
    let destination = selectedIp;
    let forwardHost;
    if (selectedDeviceName) {
      // Destination is local if reachable, else forward local via public
      const { localIp, publicIp } = fleetList.find((p) => p.deviceName === selectedDeviceName);
      const isLocalReachable = state[Utils.isReachableKey(selectedDeviceName, 'local')];
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
      }),
    });
    const json = await res.json();
    console.log(JSON.stringify(json));
    return json;
  } catch (error) {
    console.log(error);
    throw error;
  }
};
