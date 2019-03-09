const { config, log, conduit } = require('../node-common')(['config', 'log', 'conduit']);

module.exports = async (packet, res) => {
  log.debug(`<< /set: ${JSON.stringify(packet.message)}`);

  await conduit.send({
    to: 'visuals', topic: 'setAll', message: { all: packet.message.all },
  });

  conduit.respond(res, {
    status: 200,
    message: { content: 'OK' },
  });
};
