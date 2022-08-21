/* global CONDUIT_PORT */

/**
 * Send a conduit packet.
 *
 * @param {object} packet - Packet to send.
 * @param {string} [tokenOverride] - Override auth token sent.
 * @returns {Promise<object|Error>} Response or error encountered.
 */
// eslint-disable-next-line no-unused-vars
const sendPacket = async (packet, tokenOverride) => {
  const ip = fab.getState('ip');
  const token = fab.getState('token');

  fab.updateState('logEntries', ({ logEntries }) => [...logEntries, 'Sending...']);

  try {
    const res = await fetch(`http://${ip}:${CONDUIT_PORT}/conduit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...packet,
        auth: tokenOverride || token || '',
      }),
    });
    const json = await res.json();
    fab.updateState('logEntries', ({ logEntries }) => [...logEntries, JSON.stringify(json)]);
    return json;
  } catch (error) {
    fab.updateState('logEntries', ({ logEntries }) => [...logEntries, error.message]);
    throw error;
  }
};
