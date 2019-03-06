const { config, log, conduit } = require('../node-common')(['config', 'log', 'conduit']);
const anims = require('../modules/anims');

module.exports = async (packet, res) => {
  log.debug('<< /off');

  anims.clearAll();
  await conduit.send({
    to: 'LedServer', topic: 'setAll', message: { all: [0, 0, 0] }
  });

  conduit.respond(res, {
    status: 200,
    message: { content: 'OK' }
  });
};