const { execSync } = require('child_process');
const fs = require('fs');
const schema = require('./schema');

/**
 * Get app install path.
 *
 * @returns {string} The output from `pwd` in this process.
 */
const getInstallPath = () => execSync('pwd').toString().trim();

/** Path of the example config */
const DEFAULT_PATH = `${getInstallPath()}/config-default.json`;
/** Path of the actual config */
const CONFIG_PATH = `${getInstallPath()}/config.json`;

let config = {};

/**
 * Ensure a config file exists.
 */
const ensureConfigFile = () => {
  if (fs.existsSync(CONFIG_PATH)) {
    console.log('Loaded config.json');
    return;
  }

  if (!fs.existsSync(DEFAULT_PATH)) {
    console.log('No config-default.json available!');
    return;
  }

  // Create from default.
  const defaultConfig = JSON.parse(fs.readFileSync(DEFAULT_PATH, 'utf8'));
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(defaultConfig, null, 2), 'utf8');
  console.log('Set up new config.json from config-default.json - may require additional configuration.');
};

ensureConfigFile();
config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));

/**
 * Allow modules to require certain keys in config.json.
 *
 * @param {string} name - Module name.
 * @param {object} partialSchema - Partial JSON schema for the module's config spec.
 * @returns {object} Validaated schema.
 */
config.withSchema = (name, partialSchema) => {
  if (!schema(config, partialSchema)) {
    console.log(`Module ${name} is missing some configuration keys.`);
    process.exit(1);
  }

  return config;
};

config.getInstallPath = getInstallPath;

// Behave as if we required config.json directly
module.exports = config;
