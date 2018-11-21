const { spawn } = require('child_process');
const fs = require('fs');
const config = require('./config.json');

const INTERVAL_MS = 5000;

const children = {};

const waitAsync = ms => new Promise(resolve => setTimeout(resolve, ms));

const queue = async (items) => {
  if (!items.length) {
    return;
  }

  const next = items.shift();
  return next().then(() => queue(items));
};

const main = () => {
  const promises = Object.keys(config).map(app => async () => {
    if (!fs.existsSync(`${__dirname}/../apps/${app}`)) {
      throw new Error(`App does not exist: ${app}`);
    }

    if (!config[app]) {
      return;
    }

    console.log(`Spawning process for ${app}`);
    children[app] = spawn(`cd ../apps/${app} && npm start`, { stdio: 'inherit', shell: true });

    return waitAsync(INTERVAL_MS);
  });

  queue(promises);
};

main();
