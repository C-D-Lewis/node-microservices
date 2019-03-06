const { leds, log, conduit } = require('../node-common')(['leds', 'log', 'conduit']);

module.exports = (packet, res) => {
  log.debug(`<< setAll: ${JSON.stringify(packet.message)}`);

  leds.setAll(packet.message.all);

  conduit.respond(res, {
    status: 200,
    message: { content: 'OK' }
  });
};
