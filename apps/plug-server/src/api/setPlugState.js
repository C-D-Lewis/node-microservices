const {
  log, conduit
} = require('@chris-lewis/node-common')(['log', 'conduit']);

const devices = require('../modules/devices');

module.exports = (packet, res) => {
  log.debug(`<< setPlugState ${JSON.stringify(packet.message)}`);

  const { alias, state } = packet.message;
  try {
    devices.setPlugState(alias, state);
    conduit.respond(res, {
      status: 202,
      message: { content: 'Accepted' }
    });
  } catch (e) {
    log.error(`Error updating plug ${alias} to state ${state}`);
    log.error(e);

    conduit.respond(res, {
      status: e.message.includes('not found') ? 404 : 500,
      error: `Error updating plug ${alias} to state ${state}: ${e.message}`
    });
  }
};
