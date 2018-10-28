const {
  log, conduit
} = require('@chris-lewis/node-common')(['log', 'conduit']);

const devices = require('../modules/devices');

module.exports = (packet, res) => {
  log.debug(`<< rediscover ${JSON.stringify(packet.message)}`);

  devices.rediscover();

  conduit.respond(res, {
    status: 202,
    message: { content: 'Rediscovery started' }
  });
};
