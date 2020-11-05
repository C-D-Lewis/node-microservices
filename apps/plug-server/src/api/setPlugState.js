const { log, conduit } = require('../node-common')(['log', 'conduit']);
const devices = require('../modules/devices');

/**
 * Handle a 'setPlugState' topic packet.
 *
 * @param {Object} packet - The conduit packet request.
 * @param {Object} res - Express response object.
 */
const handleSetPlugState = (packet, res) => {
  const { alias, state } = packet.message;

  try {
    devices.setPlugState(alias, state);

    conduit.respond(res, { status: 202, message: { content: 'Accepted' } });
  } catch (e) {
    log.error(e);
    log.error(`Error updating plug ${alias} to state ${state}`);

    const status = e.message.includes('not found') ? 404 : 500;
    conduit.respond(res, {
      status,
      error: `Error updating plug ${alias} to state ${state}: ${e.message}`,
    });
  }
};

module.exports = handleSetPlugState;
