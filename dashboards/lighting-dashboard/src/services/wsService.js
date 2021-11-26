const {
  wsServer,
} = window.Config;

/** WebSocket server port */
const WS_PORT = 7777;
/** Get hostnames topic */
const TOPIC_GLOBAL_GET_HOSTNAMES = '/global/getHostnames';
/** Get hostnames response topic */
const TOPIC_GLOBAL_GET_HOSTNAMES_RESPONSE = '/global/getHostnamesResponse';

let socket;

/**
 * When a message is received.
 *
 * @param {string} topic - Message topic.
 * @param {object} data - Message data.
 */
const onMessage = (topic, data) => {
  // Receive hostnames
  if (topic === TOPIC_GLOBAL_GET_HOSTNAMES_RESPONSE) {
    const { hostname } = data;
    fabricate.updateState('devices', ({ devices }) => [...devices, { hostname }]);
  }
};

/**
 * Send a conduit packet over WebSocket.
 *
 * @param {object} device - Device object.
 * @param {object} packet - Conduit packet to send.
 */
// eslint-disable-next-line no-unused-vars
const websocketSendPacket = (device, packet) => {
  const topic = `/devices/${device.hostname}/conduit`;
  socket.send(JSON.stringify({
    topic,
    data: packet,
  }));
};

/**
 * Connect websocket server.
 *
 * @returns {Promise<void>}
 */
// eslint-disable-next-line no-unused-vars
const websocketConnect = () => new Promise((resolve) => {
  socket = new WebSocket(`ws://${wsServer}:${WS_PORT}`);

  socket.onopen = () => {
    // Request hostnames
    socket.send(JSON.stringify({ topic: TOPIC_GLOBAL_GET_HOSTNAMES, data: {} }));

    console.log('Connected');
    resolve();
  };

  socket.onmessage = async (event) => {
    const str = await event.data.text();
    const { topic, data } = JSON.parse(str);
    onMessage(topic, data);
  };
});
