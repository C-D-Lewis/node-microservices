const { log, conduit } = require('../node-common')(['log', 'conduit']);

/**
 * Send a Conduit packet.
 *
 * @param {object} args - plugin ARGS object.
 */
module.exports = async (args) => {
  const response = await conduit.send(args);
  log.info({ response });
};
