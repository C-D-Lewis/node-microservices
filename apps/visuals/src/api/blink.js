const { leds, conduit } = require('../node-common')(['leds', 'conduit']);

module.exports = ({ message }, res) => {
  for (let i = 0; i < leds.getNumLEDs(); i += 1) {
    if (message[i]) {
      leds.blink(i, message[i]);
    }
  }

  conduit.respond(res, { status: 200, message: { content: 'OK' } });
};
