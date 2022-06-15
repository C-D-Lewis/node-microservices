import store from '../store';
import { setResponseBarText } from '../actions';

/** Port to look for conduit apps */
const CONDUIT_PORT = 5959;

export const sendPacket = async (packet) => {
  const { ip, token } = store.getState();

  store.dispatch(setResponseBarText('Sending...'));

  const opts = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...packet,
      auth: token || '',
    }),
  };

  try {
    const res = await fetch(`http://${ip}:${CONDUIT_PORT}/conduit`, opts);
    const json = await res.json();
    store.dispatch(setResponseBarText(JSON.stringify(json)));
    return json;
  } catch (error) {
    store.dispatch(setResponseBarText(error.message));
    throw error;
  }
};
