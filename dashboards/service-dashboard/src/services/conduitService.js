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
  fabricate.update('logEntries', ({ logEntries }) => [...logEntries, 'Sending...']);

  try {
    const { ip, token } = state;
    const res = await fetch(`http://${ip}:${Constants.CONDUIT_PORT}/conduit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...packet,
        auth: tokenOverride || token || '',
      }),
    });
    const json = await res.json();
    fabricate.update('logEntries', ({ logEntries }) => [...logEntries, JSON.stringify(json)]);
    return json;
  } catch (error) {
    fabricate.update('logEntries', ({ logEntries }) => [...logEntries, error.message]);
    throw error;
  }
};
