/** WebSocket server port */
const WS_PORT = 7777;
/** Heartbeat interval */
const HEARTBEAT_INTERVAL_MS = 30000;

let socket;
let heartbeatHandle;

const ClacksService = {};

/**
 * Set the connected state.
 *
 * @param {boolean} connected - true if now connected.
 */
const setConnectedState = (connected) => fabricate.updateState('clacksData', () => ({ ...fabricate.getState('clacksData'), connected }));

/**
 * When a message is received.
 *
 * @param {string} topic - Message topic.
 * @param {object} data - Message data.
 */
const onClacksMessage = (topic, data) => {
  fabricate.updateState('logEntries', ({ logEntries }) => [...logEntries, JSON.stringify({ topic, data })]);
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
 * @returns {Promise<void>}
 */
ClacksService.connect = () => new Promise((resolve) => {
  const ip = fabricate.getState('ip');
  socket = new WebSocket(`ws://${ip}:${WS_PORT}`);

  socket.onopen = () => {
    console.log('Connected');
    startHeartbeat();
    setConnectedState(true);
    resolve();
  };

  socket.onmessage = async (event) => {
    const str = await event.data.text();
    const { topic, data } = JSON.parse(str);
    onClacksMessage(topic, data);
  };

  socket.onclose = () => {
    setConnectedState(false);
    setTimeout(ClacksService.connect, 5000);
  };

  socket.onerror = (err) => {
    console.log(err);
    socket.close();
  };
});

/**
 * Disconnect from server.
 */
ClacksService.disconnect = () => socket.close();

/**
 * Send a clacks WebSocket message.
 *
 * @param {string} topic - Topic to use.
 * @param {string} message - Message to send, must be JSON
 */
ClacksService.sendMessage = (topic, message) => {
  const payload = { topic, data: JSON.parse(message) };
  socket.send(JSON.stringify(payload));
  fabricate.updateState('logEntries', ({ logEntries }) => [...logEntries, `Sent: ${JSON.stringify(payload)}`]);
};
