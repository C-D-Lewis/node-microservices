const { textDisplay } = require('../node-common')(['textDisplay']);

/**
 * Handle a 'setText' topic packet.
 *
 * @param {object} packet - The bifrost packet request.
 * @returns {object} Response data.
 */
const handleSetTextPacket = (packet) => {
  const { lines } = packet.message;
  textDisplay.setLines(lines);

  return { message: { content: 'OK' } };
};

module.exports = handleSetTextPacket;
