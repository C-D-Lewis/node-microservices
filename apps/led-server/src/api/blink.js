const {
  leds, log, conduit
} = require('@chris-lewis/node-common')(['leds', 'log', 'conduit']);

module.exports = (packet, res) => {
  log.debug(`<< blink: ${JSON.stringify(packet.message)}`);

  const numLeds = leds.getNumLEDs();
  for(let i = 0; i < numLeds; i++) {
    if(packet.message[i]) leds.blink(i, packet.message[i]);
  }

  conduit.respond(res, {
    status: 200,
    message: { content: 'OK' }
  });
};
