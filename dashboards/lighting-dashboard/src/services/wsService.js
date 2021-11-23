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
    
    return;
  }
};

/**
 * Connect websocket server.
 *
 * @returns {Promise}
 */
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
