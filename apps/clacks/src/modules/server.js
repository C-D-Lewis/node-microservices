const WebSocket = require('ws');

const { config } = require('../node-common')(['config']);

config.requireKeys('server.js', {
  required: ['SERVER'],
  properties: {
    SERVER: {
      required: ['PORT'],
      properties: {
        PORT: {
          type: 'number',
        },
      },
    },
  },
});

const { SERVER: { PORT } } = config;

let server;

/**
 * Broadcast data to all clients.
 *
 * @param {string} data - Data to send
 */
const broadcast = (data) => server.clients.forEach((p) => p.send(data));

/**
 * When a client sends a message.
 *
 * @param {object} client - Client that sent the message.
 * @param {string} data - The message.
 */
const onClientMessage = (client, data) => {
  console.log(`message: ${data}`);

  // Re-broadcast message to all clients
  broadcast(data);
};

/**
 * When a new client connects.
 *
 * @param {object} client - The newly connected client.
 */
const onNewClient = (client) => {
  console.log('New client connected');

  client.on('message', (data) => onClientMessage(client, data));
};

/**
 * Start the WS server.
 */
const start = () => {
  server = new WebSocket.Server({ port: PORT });
  console.log(`Server listening on ${PORT}`);

  // Handle new connections
  server.on('connection', onNewClient);
};

/**
 * Stop the server.
 */
const stop = () => {
  console.log('Stopping server');
  server.close();
};

module.exports = {
  start,
  stop,
};
