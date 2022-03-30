const { existsSync } = require('fs');
const { spawn } = require('child_process');
const fetch = require('node-fetch').default;
const printTable = require('../functions/printTable');

/** Default conduit port */
const CONDUIT_PORT = 5959;

/**
 * Fetch the running apps list.
 *
 * @returns {Array<object>} List of apps. 
 */
const fetchRunningApps = async () => fetch(`http://localhost:${CONDUIT_PORT}/apps`).then(r => r.json());

/**
 * Launch an app by name.
 *
 * @param {string} appName - Name of the app to start.
 */
const start = async (appName) => {
  const appDir = `${__dirname}/../../../../apps/${appName}`;
  if (!existsSync(appDir)) throw new Error(`App does not exist: ${appName}`);

  const options = { stdio: 'ignore', shell: true, detatched: true };
  const child = spawn(`cd ${appDir} && npm start`, options);
  // Remove stdio option above and uncomment to monitor
  // child.stdout.on('data', (data) => {
  //   console.log(`${appName}: ${data}`);
  // });
  console.log(`Started ${appName} in the background`);
  child.unref();
};

/**
 * Stop an app.
 *
 * @param {string} appName - Name of the app to stop.
 */
const stop = async (appName) => {
  // Get apps running
  const apps = await fetchRunningApps();
  const found = apps.find(p => p.app === appName);
  if (!found) throw new Error(`App ${appName} is not running`);

  const { port } = found;
  const res = await fetch(`http://localhost:${port}/kill`, { method: 'POST' }).then(r => r.json());
  if (!res.stop) throw new Error(`Failed to stop app: ${res}`);

  console.log(`Stopped ${appName}`);
};

/**
 * List running apps.
 */
const list = async () => {
  const apps = await fetchRunningApps();

  const headers = ['name', 'port', 'pid', 'status'];
  const rows = apps.reduce((acc, p) => ([...acc, [p.app, p.port, p.pid, p.status.slice(0, 64)]]), []);
  printTable(headers, rows);
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
  },
};
