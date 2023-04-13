/* eslint-disable no-param-reassign */
const WebSocket = require('ws');
const { hostname } = require('os');
const { config, log, bifrost } = require('../node-common')(['config', 'log', 'bifrost']);

const {
  OPTIONS: {
    AUTH_TOKENS,
    FLEET: { HOST },
  },
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
    FLEET: {
      required: ['HOST'],
      properties: {
        HOST: { type: 'string' },
      },
    },
  },
});

// Allowed exports - should NOT use the client common module for sockets
const {
  PORT,
  TOPIC_WHOAMI,
  TOPIC_HEARTBEAT,
  TOPIC_KNOWN_APPS,

  validatePacket,
  formatPacket,
  createReplyPacket,
  stringifyPacket,
} = bifrost;

/** This hostname */
const HOSTNAME = hostname();

const clients = [];
let server;

/**
 * Reply to a packet to a specific source.
 * Should be used instead of client common module reply()
 *
 * @param {object} packet - Packet receieved.
 * @param {object} message - Message data for reply.
 * @param {object} socket - Sender socket.
 * @returns {void}
 */
const reply = async (packet, message, socket) => {
  const payload = createReplyPacket(packet, message);

  if (!socket) {
    log.error(`Can't reply as scoket is not ready: ${JSON.stringify(message)}`);
    return;
  }

  socket.send(stringifyPacket('<>', payload));
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
    validatePacket(packet);
    log.debug(`RAW: ${data.toString()}`);
  } catch (e) {
    log.error(e);
    return;
  }

  const {
    id, to, from, topic, token, message, fromHostname, toHostname,
  } = packet;
  if (topic !== TOPIC_HEARTBEAT) {
    log.debug(`REC ${formatPacket(packet)}`);
  }

  // Ignore heartbeats received
  if (topic === TOPIC_HEARTBEAT) return;

  // Client declaring app name (unique combination)
  if (topic === TOPIC_WHOAMI) {
    const { hostname: whoamiHostname } = message;
    client.appName = from;
    client.hostname = whoamiHostname;
    log.info(`Registered: ${from}@${whoamiHostname}`);
    return;
  }

  // Provide connected apps (and isn't the reply)
  if (topic === TOPIC_KNOWN_APPS && id) {
    reply(packet, { apps: clients.map((p) => p.appName) }, client);
    return;
  }

  // If not from localhost, token required?
  const { ip: remoteIp = '' } = client;
  const shouldCheckToken = AUTH_TOKENS && !['127.0.0.1', 'localhost'].includes(remoteIp);
  if (shouldCheckToken) {
    log.debug(`Origin: ${remoteIp} requires guestlist check`);

    // No token when one was expected
    if (!token) {
      reply(packet, { error: 'No authorization provided' }, client);
      return;
    }

    // Verify the token provided - throws on error returned
    try {
      // Use library here as it's a local app call
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
      reply(packet, { error: `Authorization check failed: ${e.message}` }, client);
      return;
    }
  }

  // Forward if a bifrost has connected by the hostname, else match a local app by name
  let target;
  if (toHostname && toHostname !== HOSTNAME) {
    target = clients.find((p) => p.hostname === toHostname);
  } else {
    target = clients.find((p) => p.appName === to);
  }
  log.debug({ to, toHostname, target: target && target.hostname });
  if (!target) {
    log.error(`Unknown: ${to}@${toHostname} from ${fromHostname}`);
    reply(packet, { error: 'Not Found' }, client);
    return;
  }

  // toHostname served purpose - remove it
  delete packet.toHostname;

  // Forward to that app connection
  target.send(JSON.stringify(packet));
  log.debug(`FWD ${to}@${target.hostname}:${topic}`);
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

/**
 * Connect to host bifrost, avoiding use of bifrost.js to allow routing from it
 * to local apps.
 */
const connectToHostServer = async () => {
  const hostSocket = new WebSocket(`ws://${HOST}:${PORT}`);
  hostSocket.on('open', () => log.info(`Connected to host: ${HOST}`));
  hostSocket.on('message', (data) => onClientMessage(hostSocket, data));
  hostSocket.on('close', () => {
    log.debug('host: closed');

    setTimeout(connectToHostServer, 5000);
  });
  hostSocket.on('error', (err) => {
    log.error(err);
    log.error('host: errored - closing');
    hostSocket.close();
  });
};

module.exports = {
  startServer,
  stopServer,
  connectToHostServer,
};
