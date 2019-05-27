const { leds, conduit } = require('../node-common')(['leds', 'conduit']);

module.exports = async ({ message }, res) => {
  await leds.setAll(message.all);

  conduit.respond(res, { status: 200, message: { content: 'OK' } });
};
