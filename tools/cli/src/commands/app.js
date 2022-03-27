const { existsSync } = require('fs');
const { spawn } = require('child_process');

/**
 * Launch an app by name.
 *
 * @param {string} appName - Name of the app to launch.
 */
const launch = async (appName) => {
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
      execute: async ([, appName]) => launch(appName),
      pattern: 'launch $appName',
    },
  },
};
