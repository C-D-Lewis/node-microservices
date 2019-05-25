const { execSync } = require('child_process');
const fs = require('fs');
const schema = require('./schema');

const getInstallPath = () => execSync('pwd').toString().trim();

const DEFAULT_PATH = `${getInstallPath()}/config-default.json`;
const CONFIG_PATH = `${getInstallPath()}/config.json`;

let config = {};

const ensureConfigFile = () => {
  if (fs.existsSync(CONFIG_PATH)) {
    console.log('Loaded config.json');
    return;
  }

  if (!fs.existsSync(DEFAULT_PATH)) {
    console.log('No config-default.json available! You should create this file.');
    return;
  }

  const defaultConfig = JSON.parse(fs.readFileSync(DEFAULT_PATH, 'utf8'));
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(defaultConfig, null, 2), 'utf8');
  console.log('Set up new config.json from config-default.json');
};

ensureConfigFile();
config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));

// Allow modules to require certain keys in config.json
config.requireKeys = (name, partialSchema) => {
  if (!schema(config, partialSchema)) {
    console.log(`Module ${name} is missing some configuration keys.`);
    process.exit(1);
  }
};

config.getInstallPath = getInstallPath;

// Behave as if I required config.json directly
module.exports = config;
