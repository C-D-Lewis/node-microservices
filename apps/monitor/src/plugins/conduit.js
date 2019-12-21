const { log, conduit } = require('../node-common')(['log', 'conduit']);

module.exports = async (args) => {
  const response = await conduit.send(args);
  log.info({ response });
};
