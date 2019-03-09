const { leds, log, conduit } = require('../node-common')(['leds', 'log', 'conduit']);

module.exports = (packet, res) => {
  log.debug(`<< setPixel: ${JSON.stringify(packet.message)}`);

  const numLeds = leds.getNumLEDs();
  for(var i = 0; i < numLeds; i++) {
    if(packet.message[i]) leds.set(i, packet.message[i]);
  }

  conduit.respond(res, {
    status: 200,
    message: { content: 'OK' }
  });
};
