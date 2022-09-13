const {
  wsServer,
} = window.Config;

/** WebSocket server port */
const WS_PORT = 7777;
/** Get hostnames topic */
const TOPIC_GLOBAL_GET_HOSTNAMES = '/global/getHostnames';
/** Get hostnames response topic */
const TOPIC_GLOBAL_GET_HOSTNAMES_RESPONSE = '/global/getHostnamesResponse';
/** Heartbeat interval */
const HEARTBEAT_INTERVAL_MS = 30000;

let socket;
let heartbeatHandle;

const WsService = {};

/**
 * When a message is received.
 *
 * @param {string} topic - Message topic.
 * @param {object} data - Message data.
 */
const onMessage = (topic, data) => {
  // Receive hostnames - data is a device
  if (topic === TOPIC_GLOBAL_GET_HOSTNAMES_RESPONSE) {
    const { hostname } = data;

    fabricate.updateState('devices', ({ devices }) => {
      // Already known
      if (devices.find((p) => p.hostname === hostname)) return devices;

      // Add new
      return [...devices, { ...data }];
    });
  }
};

/**
 * Start heartbeat loop.
 */
const startHeartbeat = () => {
  const thisDeviceTopic = '/lighting-dashboard/heartbeat';

  clearInterval(heartbeatHandle);
  heartbeatHandle = setInterval(() => {
    socket.send(JSON.stringify({ topic: thisDeviceTopic, data: {} }));
  }, HEARTBEAT_INTERVAL_MS);
};

/**
 * Send a conduit packet over WebSocket.
 *
 * @param {object} device - Device object.
 * @param {object} packet - Conduit packet to send.
 */
WsService.sendPacket = (device, packet) => {
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
WsService.connect = () => new Promise((resolve) => {
  socket = new WebSocket(`ws://${wsServer}:${WS_PORT}`);

  socket.onopen = () => {
    // Request hostnames
    socket.send(JSON.stringify({ topic: TOPIC_GLOBAL_GET_HOSTNAMES, data: {} }));

    console.log('Connected');
    fabricate.updateState('connected', () => true);
    startHeartbeat();
    resolve();
  };

  socket.onmessage = async (event) => {
    const str = await event.data.text();
    const { topic, data } = JSON.parse(str);
    onMessage(topic, data);
  };

  socket.onclose = () => {
    fabricate.updateState('connected', () => false);
    setTimeout(WsService.connect, 5000);
  };

  socket.onerror = (err) => {
    console.log(err);
    socket.close();
  };
});
