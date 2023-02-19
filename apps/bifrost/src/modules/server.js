/* eslint-disable no-param-reassign */
const WebSocket = require('ws');
const { config, log, bifrost } = require('../node-common')(['config', 'log', 'bifrost']);

const {
  OPTIONS: { AUTH_TOKENS },
} = config.withSchema('server.js', {
  required: ['OPTIONS'],
  properties: {
    OPTIONS: {
      properties: {
        AUTH_TOKENS: {
          type: 'boolean',
          description: 'Whether to verify auth tokens when not from localhost',
        },
      },
    },
  },
});

const {
  PORT,
  TOPIC_WHOAMI,
  TOPIC_HEARTBEAT,
  TOPIC_KNOWN_APPS,
} = bifrost;

const clients = [];
let server;

/**
 * Handle a packet.
 *
 * @param {object} packet - Received message data.
 */
const handlePacket = (packet) => {
  const { to, topic, host } = packet;

  // TODO: Dashboards require forwarding to another host
  // How to await secondary response and pass back?
  // Server uses library but doesn't handle many connections
  if (host) {

  }

  // Check local app is available
  const target = clients.find((p) => p.appName === to);
  if (!target) {
    log.error(`Unknown: ${to}`);
    bifrost.reply(packet, { error: 'Not Found' });
    return;
  }

  // Forward to that local app
  target.send(JSON.stringify(packet));
  log.debug(`FWD ${to}:${topic}`);
};

/**
 * When a client sends a message.
 *
 * @param {object} client - Client that sent the message.
 * @param {ArrayBuffer} data - The message.
 */
const onClientMessage = async (client, data) => {
  // Ensure it has the right data
  let packet;
  try {
    packet = JSON.parse(data.toString());
    bifrost.validatePacket(packet);
  } catch (e) {
    log.error(e);
    return;
  }

  const {
    id, to, from, topic, token,
  } = packet;
  if (topic !== TOPIC_HEARTBEAT) {
    log.debug(`REC ${bifrost.formatPacket(packet)}`);
  }

  // Client declaring app name (unique combination)
  if (topic === TOPIC_WHOAMI) {
    // Annotate this client
    client.appName = from;
    return;
  }

  // Ignore heartbeats received
  if (topic === TOPIC_HEARTBEAT) return;

  // Provide connected apps (and isn't the reply)
  if (topic === TOPIC_KNOWN_APPS && id) {
    bifrost.reply(packet, { apps: clients.map((p) => p.appName) });
    return;
  }

  // If not from localhost, token required?
  const { ip: remoteIp = '' } = client;
  const shouldCheckToken = AUTH_TOKENS && !['127.0.0.1', 'localhost'].includes(remoteIp);
  if (shouldCheckToken) {
    log.debug(`Origin: ${remoteIp} requires guestlist check`);

    // No token when one was expected
    if (!token) {
      await bifrost.reply(packet, { error: 'No authorization provided' });
      return;
    }

    // Verify the token provided - throws on error returned
    try {
      await bifrost.send({
        to: 'guestlist',
        topic: 'authorize',
        message: {
          to,
          topic,
          token,
        },
      });
    } catch (e) {
      await bifrost.reply(packet, { error: `Authorization check failed: ${e.message}` });
      return;
    }
  }

  // Handle packet, getting it where it needs to go
  handlePacket(packet);
};

/**
 * When a new client connects.
 *
 * @param {object} client - The newly connected client.
 * @param {object} req - Request object.
 */
const onNewClient = (client, req) => {
  const ip = req.socket.remoteAddress.split(':').pop();
  client.ip = ip;
  clients.push(client);
  log.info(`New client connected from ${ip} (${req.socket.remoteAddress})`);

  client.on('message', (data) => onClientMessage(client, data));
  client.on('close', () => {
    clients.splice(clients.indexOf(client), 1);
    log.info(`Client ${client.appName} closed connection`);
  });
};

/**
 * Start the WebSocket server.
 */
const startServer = () => {
  server = new WebSocket.Server({ port: PORT });
  server.on('connection', onNewClient);

  log.info(`Server listening on ${PORT}`);
};

/**
 * Stop the server.
 */
const stopServer = () => {
  log.info('Stopping server');
  server.close();
};

module.exports = {
  startServer,
  stopServer,
};
