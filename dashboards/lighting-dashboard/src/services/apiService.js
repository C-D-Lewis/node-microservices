import { setRequestInProgress } from '../actions';
import store from '../store';

/** Port to look for conduit apps */
const CONDUIT_PORT = 5959;

export const sendDevicePacket = async (device, packet) => {
  store.dispatch(setRequestInProgress(true));

  const opts = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...packet }),
  };

  try {
    const res = await fetch(`http://${device.ip}:${CONDUIT_PORT}/conduit`, opts);
    const json = await res.json();

    store.dispatch(setRequestInProgress(false));
    return json;
  } catch (err) {
    console.log(err);
    alert(err);

    store.dispatch(setRequestInProgress(false));
    throw err;
  }
};

export const pingDevice = async (device) => {
  store.dispatch(setRequestInProgress(true));

  try {
    const res = await fetch(`http://${device.ip}:${CONDUIT_PORT}/apps`);
    const json = await res.json();

    store.dispatch(setRequestInProgress(false));
    return json;
  } catch (err) {
    console.log(err);
    alert(err);

    store.dispatch(setRequestInProgress(false));
    throw err;
  }
}
