const { execSync } = require('child_process');
const {
  config, log, fetch, schema,
} = require('../node-common')(['config', 'log', 'fetch', 'schema']);
const { findByApp } = require('../modules/allocator');
const {
  sendBadRequest, sendNotFound, sendNotAuthorized,
} = require('../modules/util');
const respondWithApps = require('../modules/apps');
const { checkAuth } = require('../modules/auth');

config.addPartialSchema({
  required: ['SERVER'],
  properties: {
    SERVER: {
      required: ['PORT'],
      properties: {
        PORT: { type: 'integer' },
      },
    },
    OPTIONS: {
      properties: {
        AUTH_ENABLED: { type: 'boolean' },
      },
    },
  },
});

const { OPTIONS, SERVER } = config.get(['OPTIONS', 'SERVER']);

/** Default destination host (same machine) */
const HOST_LOCALHOST = 'localhost';
/** Schema for all conduit message packets. */
const PACKET_SCHEMA = {
  required: ['to', 'topic'],
  additionalProperties: false,
  properties: {
    status: { type: 'integer' },          // Response status code
    to: { type: 'string' },               // Recipient Conduit client
    topic: { type: 'string' },            // The message topic (i.e: channel)
    message: { type: 'object' },          // The message object to send
    error: { type: 'string' },            // Any response error
    from: { type: 'string' },             // Sending Conduit client
    host: { type: 'string' },             // Which other Conduit server to send to
    auth: { type: 'string' },             // Authorization, if required
    device: { type: 'string' },           // Destination device hostname, used for auth check
    forceAuthCheck: { type: 'boolean' },  // Force auth token check
  },
};
/** Default response when the recipient does not provide one. */
const NO_RESPONSE_PACKET = { status: 204, message: { content: 'No content forwarded' } };
/** Shutdown/reboot deleay time */
const DELAY_MS = 10000;

/**
 * Handle a topic meant for this conduit.
 *
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 * @param {object} packet - Packet received.
 * @returns {Promise<void>}
 */
const handleTopic = async (req, res, packet) => {
  const { topic } = packet;

  // Special command packets
  if (topic === 'shutdown') {
    setTimeout(() => execSync('sudo shutdown -h now'), DELAY_MS);
    log.info('Shutdown command received');

    res.status(200).json({ content: `Shutting down in ${DELAY_MS / 1000} seconds` });
    return;
  }

  if (topic === 'reboot') {
    setTimeout(() => execSync('sudo reboot'), DELAY_MS);
    log.info('Reboot command received');

    res.status(200).json({ content: `Restarting in ${DELAY_MS / 1000} seconds` });
  }

  if (topic === 'getApps') {
    await respondWithApps(req, res);
  }
};

/**
 * Handle a packet request by forwarding to the intended recipient and returning
 * the recipient's response.
 *
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 */
const handlePacketRequest = async (req, res) => {
  const { body: packet, hostname } = req;
  log.debug(`<< (REQ) ${JSON.stringify(packet)}`);

  // Validate packet shape
  if (!schema(packet, PACKET_SCHEMA)) {
    sendBadRequest(res);
    return;
  }

  const {
    to, topic, message, host = HOST_LOCALHOST, auth, forceAuthCheck, device,
  } = packet;

  // Test endpoint used during tests
  if (topic === 'test' && to === 'test') {
    res.status(200).json({ ok: true });
    return;
  }

  // TODO: How to allow a device to use service-dashboard for just their device?
  //       Fails because device:undefined at least

  if (!hostname) log.error('Hostname unknown');

  // Enforce only localhost need not supply an auth token (or during test)
  const shouldCheckAuth = (OPTIONS.AUTH_ENABLED && (hostname && hostname !== 'localhost')) || forceAuthCheck;
  const isAuthCheck = to === 'attic' && topic === 'get' && message && message.key === 'users';
  if (shouldCheckAuth && !isAuthCheck) {
    log.debug(`Origin: ${hostname} requires auth check`);

    if (!auth) {
      sendNotAuthorized(res, 'Authorization not provided');
      return;
    }

    const authRes = await checkAuth(auth, to, topic, device);
    log.debug(`Auth check result: ${JSON.stringify(authRes)}`);
    if (authRes.error) {
      sendNotAuthorized(res, `Authorization check failed: ${authRes.error}`);
      return;
    }
  }

  // Extract data and forward to recipient
  const appConfig = findByApp(to);

  // Meant for a local apps
  if (host === HOST_LOCALHOST) {
    // Not for other app
    if (to === 'conduit') {
      await handleTopic(req, res, packet);
      return;
    }

    // Not found locally
    if (!appConfig) {
      log.error(`No app registered with name ${to}`);
      sendNotFound(res);
      return;
    }
  }

  try {
    // In case that the host is not this one, forward it
    const port = (host === HOST_LOCALHOST) ? appConfig.port : SERVER.PORT;

    // Prevent forwarding loops by limiting to one redirection
    if (host !== HOST_LOCALHOST) {
      delete packet.host;
    }

    if (!host) {
      console.log({ host });
      throw new Error('host was not resolved');
    }

    // Deliver the packet to the recipient
    log.debug(`>> (FWD) ${host} ${to} ${topic} ${JSON.stringify(message)}`);
    const { data: response = NO_RESPONSE_PACKET } = await fetch({
      url: `http://${host}:${port}/conduit`,
      method: 'post',
      body: JSON.stringify(packet),
    });

    // Send response back from 'to' app to message sender
    delete response.from;
    delete response.to;
    delete response.auth;

    // Truncate logging all metric data
    let finalMsg = JSON.stringify(response.message);
    if (topic === 'getMetricHistory') {
      finalMsg = finalMsg.slice(0, 256);
    }

    log.debug(`<< (RES) ${response.status} ${to} ${topic} ${finalMsg}`);
    res.status(response.status || 200).json(response);
  } catch (e) {
    const error = `Error forwarding packet: ${e.stack}`;
    log.error(error);
    res.status(500).json({ status: 500, error });
  }
};

module.exports = handlePacketRequest;
