const { leds, conduit } = require('../node-common')(['leds', 'conduit']);

module.exports = (packet, res) => conduit.respond(res, {
  status: 200,
  message: { leds: leds.getState() },
});
