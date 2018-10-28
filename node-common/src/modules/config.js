const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const schema = require('./schema');

const getInstallPath = () => execSync('pwd').toString().trim();

const CONFIG_PATH = `${getInstallPath()}/config.json`;

let config = {};

(() => {
  if(!fs.existsSync(CONFIG_PATH)) {
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(config), 'utf8');
    console.log('Set up empty config.json');
    return;
  }

  config = require(CONFIG_PATH);
})();

// Allow modules to require certain keys in config.json
config.requireKeys = (moduleName, partialSchema) => {
  if(!schema(config, partialSchema)) {
    console.log(`Module ${moduleName} is missing configuration`);
    process.exit(1);
  }
};

// Behave as if I required config.json directly, with tests!
config.getInstallPath = getInstallPath;
module.exports = config;
