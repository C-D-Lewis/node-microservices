const { log, conduit } = require('../node-common')(['log', 'conduit']);
const anims = require('../modules/anims');

module.exports = (packet, res) => {
  log.debug(`<< /fade: ${JSON.stringify(packet.message)}`);

  anims.fadeTo(packet.message.all);
  conduit.respond(res, {
    status: 200,
    message: { content: 'OK' }
  });
};
