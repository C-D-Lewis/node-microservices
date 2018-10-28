const anims = require('../modules/anims');

const {
  config, log, conduit
} = require('@chris-lewis/node-common')(['config', 'log', 'conduit']);

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