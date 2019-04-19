const { leds, conduit } = require('../node-common')(['leds', 'conduit']);

module.exports = (packet, res) => {
  for (let i = 0; i < leds.getNumLEDs(); i += 1) {
    if (packet.message[i]) {
      leds.blink(i, packet.message[i]);
    }
  }

  conduit.respond(res, { status: 200, message: { content: 'OK' } });
};
