const {
  log, conduit
} = require('@chris-lewis/node-common')(['log', 'conduit']);

const devices = require('../modules/devices');

module.exports = (packet, res) => {
  log.debug(`<< getPlugs ${JSON.stringify(packet.message)}`);

  conduit.respond(res, {
    status: 200,
    message: { plugs: devices.getAvailablePlugs() }
  });
};
