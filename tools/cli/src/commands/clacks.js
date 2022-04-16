const { WebSocket } = require('ws');
const printTable = require('../functions/printTable');
const switches = require('../modules/switches');

/** WS port - assume like conduit's that it will never change */
const CLACKS_PORT = 7777;

let socket;
const subscriptions = {};

/**
 * Connect to the clacks server.
 *
 * @returns {Promise<void>}
 */
const connect = () => new Promise((resolve) => {
  const finalHost = switches.HOST || 'localhost';
  socket = new WebSocket(`ws://${finalHost}:${CLACKS_PORT}`);
  socket.on('open', resolve);

  socket.on('message', (buffer) => {
    const { topic, data } = JSON.parse(buffer.toString());
    if (!subscriptions[topic]) return;

    // Pass to the subscription
    subscriptions[topic](data);
  });
});

/**
 * Disconnect from the clacks server.
 */
const disconnect = () => socket.close();

/**
 * Get all clients.
 */
const listClients = async () => {
  const clients = [];
  // Print clients
  printTable(
    ['name'],
    clients.map((p) => [p.id, p.name, p.apps, p.topics, new Date(p.createdAt).toISOString()]),
  );
};

/**
 * Send data to a topic.
 *
 * @param {string} topic - Topic to use.
 * @param {string} data - Data to send.
 */
const send = async (topic, data) => {
  await connect();

  const message = { topic, data };
  console.log(`>> ${JSON.stringify(message)}`);
  socket.send(JSON.stringify(message));

  disconnect();
};

/**
 * Susbcribe to a topic.
 *
 * @param {string} topic - Topic to use.
 * @param {string} data - Data to send.
 */
const subscribe = async (topic) => {
  await connect();

  subscriptions[topic] = (data) => console.log(`<< ${topic} ${JSON.stringify(data)}`);
  console.log(`Subscribed to ${topic}`);
};

module.exports = {
  firstArg: 'clacks',
  description: 'Work with the clacks app.',
  operations: {
    listClients: {
      /**
       * Get all connected clients.
       *
       * @returns {Promise<void>}
       */
      execute: listClients,
      pattern: 'list-clients',
    },
    send: {
      /**
       * Send a message to a topic.
       *
       * @param {Array<string>} args - Command args.
       * @returns {Promise<void>}
       */
      execute: async ([, topic, data]) => send(topic, data),
      pattern: 'send $topic $data',
    },
    subscribe: {
      /**
       * Subscribe to a topic.
       *
       * @param {Array<string>} args - Command args.
       * @returns {Promise<void>}
       */
      execute: async ([, topic]) => subscribe(topic),
      pattern: 'subscribe $topic',
    },
  },
};
