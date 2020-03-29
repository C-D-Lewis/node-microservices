import store from '../store';
import { setBottomBarText } from '../actions';

/** Port to look for conduit apps */
const CONDUIT_PORT = 5959;

export const sendPacket = async (packet) => {
  const { ip } = store.getState();

  store.dispatch(setBottomBarText('Sending...'));

  const opts = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(packet),
  };
  const res = await fetch(`http://${ip}:${CONDUIT_PORT}/conduit`, opts);
  const json = await res.json();
  store.dispatch(setBottomBarText(JSON.stringify(json)));
  return json;
};
