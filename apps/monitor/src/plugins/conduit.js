const {
  log, conduit
} = require('@chris-lewis/node-common')(['log', 'conduit']);

module.exports = async (args) => {
  const response = await conduit.send(args);
  log.info(response);
};
