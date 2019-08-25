const { log, conduit } = require('../node-common')(['log', 'conduit']);
const anims = require('../modules/anims');

module.exports = async (packet, res) => {
  try {
    const rgbArr = await anims.spotify();

    conduit.respond(res, { status: 200, message: { content: rgbArr } });
  } catch (e) {
    log.error(e);
    conduit.respond(res, { status: 500, error: e.message });
  }
};
