/** Port to look for conduit apps */
const CONDUIT_PORT = 5959;

/**
 * Send a conduit packet.
 *
 * @param {object} packet - Packet to send.
 * @returns {Promise<object|Error>} Response or error encountered.
 */
const sendPacket = async (packet) => {
  const ip = fab.getState('ip');
  const token = fab.getState('token');

  fab.updateState('responseBarText', () => 'Sending...');

  try {
    const res = await fetch(`http://${ip}:${CONDUIT_PORT}/conduit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...packet,
        auth: token || '',
      }),
    });
    const json = await res.json();
    fab.updateState('responseBarText', () => JSON.stringify(json));
    return json;
  } catch (error) {
    fab.updateState('responseBarText', () => error.message);
    throw error;
  }
};
