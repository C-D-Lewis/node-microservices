/** Port to look for conduit apps */
const CONDUIT_PORT = 5959;

const { updateState } = fabricate;

/**
 * Send a device packet.
 *
 * @param {object} device - Device object with IP.
 * @param {object} packet - Packet to send.
 * @returns {Promise<object>} Response JSON.
 */
const sendDevicePacket = async (device, packet) => {
  updateState('requestInProgress', () => true);

  const opts = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...packet }),
  };

  try {
    const res = await fetch(`http://${device.ip}:${CONDUIT_PORT}/conduit`, opts);
    const json = await res.json();

    updateState('requestInProgress', () => false);
    return json;
  } catch (err) {
    console.log(err);
    alert(err);

    updateState('requestInProgress', () => false);
    throw err;
  }
};

/**
 * Ping a device.
 *
 * @param {object} device - Device object with IP.
 * @returns {Promise<object>} Response JSON.
 */
const pingDevice = async (device) => {
  updateState('requestInProgress', () => true);

  try {
    const res = await fetch(`http://${device.ip}:${CONDUIT_PORT}/apps`);
    const json = await res.json();

    updateState('requestInProgress', () => false);
    return json;
  } catch (err) {
    console.log(err);
    alert(err);

    updateState('requestInProgress', () => false);
    throw err;
  }
};

