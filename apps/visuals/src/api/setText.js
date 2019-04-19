const { textDisplay, conduit } = require('../node-common')(['textDisplay', 'conduit']);

module.exports = ({ message }, res) => {
  textDisplay.setLines(message.lines);

  conduit.respond(res, { status: 200, message: { content: 'OK' } });
};
