const { config, log, conduit } = require('../node-common')(['config', 'log', 'conduit']);
const anims = require('../modules/anims');

module.exports = async (packet, res) => {
  anims.clearAll();

  await conduit.send({
    to: 'visuals', topic: 'setAll', message: { all: [0, 0, 0] },
  });

  conduit.respond(res, {
    status: 200,
    message: { content: 'OK' },
  });
};