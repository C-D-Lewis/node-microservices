const request = require('request');
const { config, log, requestAsync, schema } = require('../node-common')(['config', 'log', 'requestAsync', 'schema']);
const allocator = require('../modules/allocator');
const stats = require('../modules/stats');
const util = require('../modules/util');

const LOCALHOST = 'localhost';
const MESSAGE_SCHEMA = {
  required: ['to', 'topic'],
  properties: {
    status: { type: 'integer', description: 'Response status' },
    error: { type: 'string', description: 'Any response error' },
    to: { type: 'string', description: 'Recipient Conduit client' },
    from: { type: 'string', description: 'Sending Conduit client' },
    topic: { type: 'string', description: 'The message topic (i.e: channel)' },
    message: { type: 'object', description: 'The message object to send' },
    host: { type: 'string', description: 'Which Conduit server to send to' },
  },
};

module.exports = async (req, res) => {
  // Set some defaults
  if(!req.body.from) req.body.from = 'Unknown';
  if(!req.body.host) req.body.host = LOCALHOST;
  log.debug(`<< (REQ) ${JSON.stringify(req.body)}`);

  // Validate packet
  if(!schema(req.body, MESSAGE_SCHEMA)) {
    util.badRequest(res);
    return;
  }

  // Extract data and forward to recipient
  const { to, from, host } = req.body;
  const appConfig = allocator.findByApp(to);
  delete req.body.host;
  if((host === LOCALHOST) && !appConfig) {
    log.error(`No app registered with name ${to}`);
    util.notFound(res);
    return;
  }

  // Record app communication statistics
  await stats.recordPacket(req.body);

  try {
    log.debug(`>> (FWD) ${JSON.stringify(req.body)}`);
    const port = (host === LOCALHOST) ? appConfig.port : config.SERVER.PORT;  // All Conduit servers use 5959
    const { body } = await requestAsync({
      url: `http://${host}:${port}/conduit`,
      method: 'post',
      json: req.body
    });

    // Send response to requester
    delete body.from;
    delete body.to;
    log.debug(`<< (RES) ${JSON.stringify(body)}`);

    res.status(body.status ? body.status : 200);
    res.send(body);
  } catch(err) {
    log.error('Error forwarding packet!');
    log.error(err);

    res.status(500);
    res.send({ status: 500, error: 'Error forwarding packet to recipient!' });
  }
};
