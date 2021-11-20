const { spawn } = require('child_process');
const fs = require('fs');

/** Launch interval */
const INTERVAL_S = process.arch.includes('arm') ? 10 : 3;

/**
 * Wait for some time.
 *
 * @param {number} ms - Milliseconds to wait for.
 * @returns {Promise}
 */
const waitAsync = ms => new Promise(resolve => setTimeout(resolve, ms));

/**
 * The main function.
 */
const main = async () => {
  let appList = process.argv.slice(2);

  for (let app of appList) {
    if (!fs.existsSync(`../apps/${app}`)) throw new Error(`App does not exist: ${app}`);

    const options = { stdio: 'ignore', shell: true, detatched: true };
    spawn(`cd ../apps/${app} && npm start`, options).unref();
    console.log(`Started ${app} in the background`);
    await waitAsync(INTERVAL_S * 1000);
  }

  console.log(`\nRunning ${appList.join(', ')}`);
};

main();
