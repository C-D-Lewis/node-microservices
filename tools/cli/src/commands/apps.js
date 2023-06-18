const { existsSync } = require('fs');
const { spawn } = require('child_process');
const fetch = require('node-fetch').default;
const printTable = require('../functions/printTable');
const wait = require('../functions/wait');
const switches = require('../modules/switches');

/** Default conduit port */
const CONDUIT_PORT = 5959;

/**
 * Fetch the running apps list.
 *
 * @returns {Promise<Array<object>>} List of apps.
 */
const fetchRunningApps = async () => {
  const finalHost = switches.HOST || 'localhost';
  try {
    const res = await fetch(`http://${finalHost}:${CONDUIT_PORT}/apps`);
    return res.json();
  } catch (e) {
    if (e.message.includes('ECONNREFUSED')) throw new Error('Failed to list apps - is conduit running?');

    throw e;
  }
};

/**
 * Launch an app by name.
 *
 * @param {string} appName - Name of the app to start.
 */
const start = async (appName) => {
  const appDir = `${__dirname}/../../../../apps/${appName}`;
  if (!existsSync(appDir)) throw new Error(`App ${appName} does not exist`);

  // Launch and detatch process
  const options = {
    stdio: switches.VERBOSE ? 'pipe' : 'ignore',
    shell: true,
    detatched: true,
  };
  const child = spawn(`cd ${appDir} && npm start`, options);

  if (switches.VERBOSE) {
    child.stdout.on('data', (data) => {
      console.log(`${appName}: ${data}`);
    });
  }

  console.log(`Starting ${appName}...`);
  child.unref();

  // Max attempts
  const handle = setTimeout(async () => {
    console.log(`App ${appName} failed to launch - check app logs for info`);
    process.exit(1);
  }, 10000);

  // Check it worked
  console.log('Verifying launch...');
  while (true) {
    await wait(500);

    try {
      const apps = await fetchRunningApps();
      const found = apps.find((p) => p.app === appName);
      if (found && found.status === 'OK') {
        console.log(`App ${appName} is running`);
        clearTimeout(handle);
        return;
      }
    } catch (e) {
      console.log(e.message);
    }
  }
};

/**
 * Stop an app.
 *
 * @param {string} appName - Name of the app to stop.
 */
const stop = async (appName) => {
  // Get apps running
  const apps = await fetchRunningApps();
  const found = apps.find((p) => p.app === appName);
  if (!found) throw new Error(`App ${appName} is not running`);

  const finalHost = switches.HOST || 'localhost';
  const { port } = found;

  try {
    const res = await fetch(`http://${finalHost}:${port}/kill`, { method: 'POST' }).then((r) => r.json());
    if (!res.stop) throw new Error(`Failed to stop app: ${res}`);
    console.log(`Stopped ${appName}`.green);
  } catch (e) {
    console.log(`Problem stopping ${appName} - is it already stopped?`.yellow);
    console.log(e.message);
  }
};

/**
 * Stop all running apps.
 */
const stopAll = async () => {
  const apps = await fetchRunningApps();

  // Stop all except conduit itself
  for (let i = 0; i < apps.length; i += 1) {
    const { app } = apps[i];
    if (app === 'conduit') continue;

    await stop(app);
  }

  // Stop conduit last
  await stop('conduit');
};

/**
 * List running apps.
 */
const list = async () => {
  try {
    const apps = await fetchRunningApps();

    const headers = ['name', 'port', 'pid', 'status'];
    const rows = apps.reduce(
      (acc, p) => ([...acc, [p.app, p.port, p.pid, p.status.slice(0, 64)]]),
      [],
    );
    printTable(headers, rows);
  } catch (e) {
    console.log(e);
    console.log('Failed to list apps - is conduit itself running?');
  }
};

module.exports = {
  firstArg: 'apps',
  description: 'Work with apps.',
  operations: {
    startApp: {
      /**
       * Launch an app.
       *
       * @param {Array<string>} args - Command args
       * @returns {Promise<void>}
       */
      execute: async ([appName]) => start(appName),
      pattern: '$appName start',
    },
    stopApp: {
      /**
       * Stop an app.
       *
       * @param {Array<string>} args - Command args
       * @returns {Promise<void>}
       */
      execute: async ([appName]) => stop(appName),
      pattern: '$appName stop',
    },
    listApps: {
      /**
       * List running apps.
       *
       * @returns {Promise<void>}
       */
      execute: list,
      pattern: 'list',
    },
    stopAll: {
      /**
       * Stop all running apps.
       *
       * @returns {Promise<void>}
       */
      execute: stopAll,
      pattern: 'stop-all',
    },
  },
};
