const { log } = require('../node-common')(['log']);

/** Minimum port number */
const PORT_MIN = 6000;
/** Maximum port number */
const PORT_MAX = 9000;

const configs = []; // Each item is: { app, port }

/**
 * Find an app by 'app' name
 *
 * @param {string} app - App name to find.
 * @returns {Object} The corresponding app config.
 */
const findByApp = app => configs.find(item => item.app === app);

/**
 * Send a config over the network.
 *
 * @param {Object} res - Express request object.
 * @Param {Object} config - App config to send.
 */
const sendConfig = (res, config) => res.status(200).send(config);

/**
 * Roll a random port number.
 *
 * @returns {number} New port number for the app to self-allocage.
 */
const roll = () => Math.round(Math.random() * (PORT_MAX - PORT_MIN)) + PORT_MIN;

/**
 * Generate a port number that hasn't been used before.
 *
 * @returns {number} New unique port number to use.
 */
const generatePortNumber = () => {
  let port = roll();
  while(configs.find(item => item.port === port)) {
    port = roll();
  }

  return port;
};

/**
 * Send port to the requesting app.
 *
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
const sendPort = (req, res) => {
  const { app } = req.body;
  const foundConfig = findByApp(app);
  if (foundConfig) {
    sendConfig(res, foundConfig);
    log.info(`Sent existing port ${foundConfig.port} to ${app}`);
    return;
  }

  const newConfig = { app, port: generatePortNumber() };
  configs.push(newConfig);
  sendConfig(res, newConfig);
  log.info(`Allocated new port ${newConfig.port} to ${app}`);
};

module.exports = {
  findByApp,
  sendPort,
  getAll: () => configs
};
