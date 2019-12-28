const { conduit } = require('../node-common')(['conduit']);
const { demoAnimation } = require('../modules/anims');

/**
 * Handle a 'demo' topic packet.
 *
 * @param {Object} packet - The conduit packet request.
 * @param {Object} res - Express response object.
 */
const handleDemoPacket = (packet, res) => {
  demoAnimation();

  conduit.respond(res, { status: 200, message: { content: 'OK' } });
};

module.exports = handleDemoPacket;
