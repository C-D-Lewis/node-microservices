const request = require('request');
const {
  config, log, requestAsync, schema,
} = require('../node-common')(['config', 'log', 'requestAsync', 'schema']);
const allocator = require('../modules/allocator');
const stats = require('../modules/stats');
const util = require('../modules/util');

const LOCALHOST = 'localhost';
const MESSAGE_SCHEMA = {
  required: ['to', 'topic'],
  properties: {
    status: { type: 'integer', description: 'Response status' },
    to: { type: 'string', description: 'Recipient Conduit client' },
    topic: { type: 'string', description: 'The message topic (i.e: channel)' },
    message: { type: 'object', description: 'The message object to send' },
    error: { type: 'string', description: 'Any response error' },
    from: { type: 'string', description: 'Sending Conduit client' },
    host: { type: 'string', description: 'Which Conduit server to send to' },
  },
};

module.exports = async (req, res) => {
  // Set some defaults
  req.body.from = req.body.from || 'Unknown';
  req.body.host = req.body.host || LOCALHOST;
  log.debug(`<< (REQ) ${JSON.stringify(req.body)}`);

  if (!schema(req.body, MESSAGE_SCHEMA)) {
    util.badRequest(res);
    return;
  }

  // Extract data and forward to recipient
  const { to, from, host } = req.body;
  const appConfig = allocator.findByApp(to);
  if ((host === LOCALHOST) && !appConfig) {
    log.error(`No app registered with name ${to}`);
    util.notFound(res);
    return;
  }

  // Record app communication statistics
  await stats.recordPacket(req.body);

  try {
    log.debug(`>> (FWD) ${JSON.stringify(req.body)}`);
    const port = host === LOCALHOST ? appConfig.port : config.SERVER.PORT;  // All Conduit servers use 5959
    const { body } = await requestAsync({
      url: `http://${host}:${port}/conduit`,
      method: 'post',
      json: req.body,
    });

    // Send response to requester
    delete body.from;
    delete body.to;
    log.debug(`<< (RES) ${JSON.stringify(body)}`);
    res.status(body.status || 200).send(body);
  } catch(err) {
    log.error('Error forwarding packet!');
    log.error(err);
    res.status(500) .send({ status: 500, error: 'Error forwarding packet to recipient!' });
  }
};
