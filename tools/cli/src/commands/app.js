const { existsSync } = require('fs');
const { spawn } = require('child_process');
const fetch = require('node-fetch').default;

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
  console.log(res);
};

module.exports = {
  firstArg: 'app',
  description: 'Work with apps.',
  operations: {
    launchApp: {
      /**
       * Launch an app.
       *
       * @param {Array<string>} args - Command args
       * @returns {Promise<void>}
       */
      execute: async ([, appName]) => start(appName),
      pattern: 'start $appName',
    },
    stopApp: {
      /**
       * Stop an app.
       *
       * @param {Array<string>} args - Command args
       * @returns {Promise<void>}
       */
      execute: async ([, appName]) => stop(appName),
      pattern: 'stop $appName',
    },
  },
};
