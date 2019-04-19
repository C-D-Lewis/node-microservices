const { leds, conduit } = require('../node-common')(['leds', 'conduit']);

module.exports = ({ message }, res) => {
  leds.setAll(message.all);

  conduit.respond(res, { status: 200, message: { content: 'OK' } });
};
