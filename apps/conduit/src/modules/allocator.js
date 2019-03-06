const { log, schema } = require('../node-common')(['log', 'schema']);

const MIN = 6000;
const MAX = 9000;

const configs = []; // { app, port }

const findByApp = app => configs.find(item => item.app === app);

const findByPort = port => configs.find(item => item.port === port);

const sendConfig = (res, config) => {
  res.status(200);
  res.send(config);
};

const rollPortNumber = () => Math.round(Math.random() * (MAX - MIN)) + MIN;

// Don't allocate the same one twice
const makePortNumber = () => {
  let port = rollPortNumber();
  while(findByPort(port)) {
    port = rollPortNumber();
  }

  return port;
};

const getPort = (req, res) => {
  const { app } = req.body;
  const existingConfig = findByApp(app);
  if(existingConfig) {
    sendConfig(res, existingConfig);
    log.info(`Re-sent ${existingConfig.port} to ${app}`);
    return;
  }

  const newConfig = { app, port: makePortNumber() };
  log.info(`Allocated ${newConfig.port} to ${app}`);
  configs.push(newConfig);
  sendConfig(res, newConfig);
};

module.exports = {
  findByApp,
  getPort,
  getAll: () => configs
};
