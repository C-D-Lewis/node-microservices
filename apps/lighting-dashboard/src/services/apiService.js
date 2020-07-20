/** Port to look for conduit apps */
const CONDUIT_PORT = 5959;

export const sendDevicePacket = async (device, packet) => {
  const opts = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...packet }),
  };

  try {
    const res = await fetch(`http://${device.ip}:${CONDUIT_PORT}/conduit`, opts);
    const json = await res.json();
    return json;
  } catch (err) {
    console.log(err);
    alert(err);
    throw err;
  }
};
