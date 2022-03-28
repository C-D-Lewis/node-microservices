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
 * @returns {object} The corresponding app config.
 */
const findByApp = (app) => configs.find((p) => p.app === app);

/**
 * Send a config over the network.
 *
 * @param {object} res - Express request object.
 * @Param {object} config - App config to send.
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
  while (configs.find(p => p.port === port)) {
    port = roll();
  }

  return port;
};

/**
 * Send port to the requesting app.
 *
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 */
const sendPort = (req, res) => {
  const { app, pid } = req.body;
  const foundConfig = findByApp(app);

  // Preserve port allocations - TODO: pid will be out of date
  if (foundConfig) {
    sendConfig(res, foundConfig);
    log.info(`Sent existing port ${foundConfig.port} to ${app}`);
    return;
  }

  const newConfig = { app, port: generatePortNumber(), pid };
  configs.push(newConfig);
  sendConfig(res, newConfig);
  log.info(`Allocated new port ${newConfig.port} to ${app}`);
};

module.exports = {
  findByApp,
  sendPort,
  getAll: () => configs
};
