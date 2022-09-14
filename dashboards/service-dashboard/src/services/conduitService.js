/* global Constants */

const ConduitService = {};

/**
 * Send a conduit packet.
 *
 * @param {object} state - App state.
 * @param {object} packet - Packet to send.
 * @param {string} [tokenOverride] - Override auth token sent.
 * @returns {Promise<object|Error>} Response or error encountered.
 */
ConduitService.sendPacket = async (state, packet, tokenOverride) => {
  fabricate.updateState('logEntries', ({ logEntries }) => [...logEntries, 'Sending...']);

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
    fabricate.updateState('logEntries', ({ logEntries }) => [...logEntries, JSON.stringify(json)]);
    return json;
  } catch (error) {
    fabricate.updateState('logEntries', ({ logEntries }) => [...logEntries, error.message]);
    throw error;
  }
};
