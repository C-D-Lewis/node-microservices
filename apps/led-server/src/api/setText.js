const {
  textDisplay, log, conduit
} = require('@chris-lewis/node-common')(['textDisplay', 'log', 'conduit']);

module.exports = (packet, res) => {
  log.debug(`<< setText: ${JSON.stringify(packet.message)}`);

  textDisplay.setLines(packet.message.lines);

  conduit.respond(res, {
    status: 200,
    message: { content: 'OK' }
  });
};
