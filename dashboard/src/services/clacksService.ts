import { Fabricate } from 'fabricate.js';
import { AppState, WSMessageEvent } from '../types';

declare const fabricate: Fabricate<AppState>;

/** WebSocket server port */
const WS_PORT = 7777;
/** Heartbeat interval */
const HEARTBEAT_INTERVAL_MS = 30000;

let socket: WebSocket;
let heartbeatHandle: NodeJS.Timer;

/**
 * Set the connected state.
 *
 * @param {boolean} connected - true if now connected.
 * @returns {void}
 */
export const setConnectedState = (connected: boolean) => fabricate.update(
  'clacksData',
  ({ clacksData }) => ({ ...clacksData, connected }),
);

/**
 * When a message is received.
 *
 * @param {string} topic - Message topic.
 * @param {object} data - Message data.
 */
const onClacksMessage = (topic: string, data: object) => {
  console.log(JSON.stringify({ topic, data }));
};

/**
 * Start heartbeat loop.
 */
const startHeartbeat = () => {
  const thisDeviceTopic = '/service-dashboard/heartbeat';

  clearInterval(heartbeatHandle);
  heartbeatHandle = setInterval(() => {
    socket.send(JSON.stringify({ topic: thisDeviceTopic, data: {} }));
  }, HEARTBEAT_INTERVAL_MS);
};

/**
 * Connect websocket server.
 *
 * @param {string} host - IP to connect to.
 * @returns {Promise<void>}
 */
export const connectClacks = (host: string) => new Promise((resolve) => {
  socket = new WebSocket(`ws://${host}:${WS_PORT}`);

  /**
   * When socket opens.
   */
  socket.onopen = () => {
    console.log('Connected');
    startHeartbeat();
    setConnectedState(true);
    resolve(undefined);
  };

  /**
   * When a message is received.
   *
   * @param {object} event - WS event.
   */
  socket.onmessage = async (event: WSMessageEvent) => {
    const str = await event.data.text();
    const { topic, data } = JSON.parse(str);
    onClacksMessage(topic, data);
  };

  /**
   * When socket is closed.
   */
  socket.onclose = () => {
    setConnectedState(false);
    setTimeout(() => connectClacks(host), 5000);
  };

  /**
   * When a socket error occurs.
   *
   * @param {*} err - Error.
   */
  socket.onerror = (err: unknown) => {
    console.log(err);
    socket.close();
  };
});

/**
 * Disconnect from server.
 *
 * @returns {void}
 */
export const disconnectClacks = () => socket.close();

/**
 * Send a clacks WebSocket message.
 *
 * @param {string} topic - Topic to use.
 * @param {string} message - Message to send, must be JSON string.
 */
export const sendClacksMessage = (topic: string, message: string) => {
  const payload = { topic, data: JSON.parse(message) };
  socket.send(JSON.stringify(payload));
  console.log(`Sent: ${JSON.stringify(payload)}`);
};
