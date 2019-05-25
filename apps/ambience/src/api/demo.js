const { log, conduit } = require('../node-common')(['log', 'conduit']);
const anims = require('../modules/anims');

module.exports = (packet, res) => {
  anims.demo();

  conduit.respond(res, {
    status: 200,
    message: { content: 'OK' },
  });
};
