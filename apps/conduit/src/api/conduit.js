const {
  config, log, requestAsync, schema,
} = require('../node-common')(['config', 'log', 'requestAsync', 'schema']);
const { findByApp } = require('../modules/allocator');
const { sendBadRequest, sendNotFound } = require('../modules/util');

config.requireKeys('conduit.js', {
  required: ['SERVER'],
  properties: {
    SERVER: {
      required: ['PORT'],
      properties: {
        PORT: { type: 'integer' },
      },
    },
  },
});

/** Default destination host (same machine) */
const DEFAULT_HOST_LOCAL = 'localhost';
/** Schema for all conduit message packets. */
const PACKET_SCHEMA = {
  required: ['to', 'topic'],
  properties: {
    status: { type: 'integer' },  // Response status
    to: { type: 'string' },       // Recipient Conduit client
    topic: { type: 'string' },    // The message topic (i.e: channel)
    message: { type: 'object' },  // The message object to send
    error: { type: 'string' },    // Any response error
    from: { type: 'string' },     // Sending Conduit client
    host: { type: 'string' },     // Which other Conduit server to send to
  },
};
/** Default response when the recipient does not provide one. */
const NO_RESPONSE_PACKET = { status: 204, message: { content: 'No content forwarded' } };

/**
 * Handle a packet request by forwarding to the intended recipient and returning
 * the recipient's response.
 *
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
const handlePacketRequest = async (req, res) => {
  const { body: packet } = req;
  log.debug(`<< (REQ) ${JSON.stringify(packet)}`);

  // Validate packet shape
  if (!schema(packet, PACKET_SCHEMA)) {
    sendBadRequest(res);
    return;
  }

  // Extract data and forward to recipient
  const { to, host = DEFAULT_HOST_LOCAL } = packet;
  const appConfig = findByApp(to);
  if ((host === DEFAULT_HOST_LOCAL) && !appConfig) {
    log.error(`No app registered with name ${to}`);
    sendNotFound(res);
    return;
  }

  try {
    // In case that the host is not this one, forward (all Conduit servers use 5959 currently)
    const port = (host === DEFAULT_HOST_LOCAL) ? appConfig.port : config.SERVER.PORT;

    // Prevent forwarding loops by limiting to one redirection
    if (host !== DEFAULT_HOST_LOCAL) {
      delete packet.host;
    }

    // Deliver the packet to the recipient
    log.debug(`>> (FWD) ${host} ${to} ${packet.topic} ${JSON.stringify(packet.message)}`);
    const { body: response = NO_RESPONSE_PACKET } = await requestAsync({
      url: `http://${host}:${port}/conduit`,
      method: 'post',
      json: packet,
    });

    // Send response from 'to' app to message sender
    delete response.from;
    delete response.to;
    log.debug(`<< (RES) ${response.status} ${packet.to} ${packet.topic} ${JSON.stringify(response.message)}`);
    res.status(response.status || 200).json(response);
  } catch (e) {
    const error = `Error forwarding packet: ${e.stack}`;
    log.error(error);
    res.status(500).json({ status: 500, error });
  }
};

module.exports = handlePacketRequest;
