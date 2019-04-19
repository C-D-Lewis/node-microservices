const { log, schema } = require('../node-common')(['log', 'schema']);

const MIN = 6000;
const MAX = 9000;

const configs = []; // { app, port }

const findByApp = app => configs.find(item => item.app === app);

const sendConfig = (res, config) => res.status(200).send(config);

const roll = () => Math.round(Math.random() * (MAX - MIN)) + MIN;

const generatePortNumber = () => {
  let port = roll();
  while(configs.find(item => item.port === port)) {
    port = roll();
  }

  return port;
};

const sendPort = (req, res) => {
  const { app } = req.body;
  const existingConfig = findByApp(app);
  if (existingConfig) {
    sendConfig(res, existingConfig);
    log.info(`Re-sent ${existingConfig.port} to ${app}`);
    return;
  }

  const newConfig = { app, port: generatePortNumber() };
  configs.push(newConfig);
  sendConfig(res, newConfig);
  log.info(`Allocated ${newConfig.port} to ${app}`);
};

module.exports = {
  findByApp,
  sendPort,
  getAll: () => configs
};
