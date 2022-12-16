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
 * @returns {void}
 */
const setConnectedState = (connected) => fabricate.update('clacksData', ({ clacksData }) => ({ ...clacksData, connected }));

/**
 * When a message is received.
 *
 * @param {string} topic - Message topic.
 * @param {object} data - Message data.
 */
const onClacksMessage = (topic, data) => {
  fabricate.update('logEntries', ({ logEntries }) => [...logEntries, JSON.stringify({ topic, data })]);
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
ClacksService.connect = (host) => new Promise((resolve) => {
  socket = new WebSocket(`ws://${host}:${WS_PORT}`);

  /**
   * When socket opens.
   */
  socket.onopen = () => {
    console.log('Connected');
    startHeartbeat();
    setConnectedState(true);
    resolve();
  };

  /**
   * When a message is received.
   *
   * @param {object} event - WS event.
   */
  socket.onmessage = async (event) => {
    const str = await event.data.text();
    const { topic, data } = JSON.parse(str);
    onClacksMessage(topic, data);
  };

  /**
   * When socket is closed.
   */
  socket.onclose = () => {
    setConnectedState(false);
    setTimeout(() => ClacksService.connect(host), 5000);
  };

  /**
   * When a socket error occurs.
   *
   * @param {*} err - Error.
   */
  socket.onerror = (err) => {
    console.log(err);
    socket.close();
  };
});

/**
 * Disconnect from server.
 *
 * @returns {void}
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
  fabricate.update('logEntries', ({ logEntries }) => [...logEntries, `Sent: ${JSON.stringify(payload)}`]);
};
