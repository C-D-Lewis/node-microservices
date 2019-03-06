const { leds, log, conduit } = require('../node-common')(['leds', 'log', 'conduit']);

module.exports = (packet, res) => {
  log.debug(`<< state: ${JSON.stringify(packet.message)}`);

  conduit.respond(res, { status: 200, message: { leds: leds.getState() } });
};
