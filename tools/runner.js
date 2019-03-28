const { spawn } = require('child_process');
const fs = require('fs');

const INTERVAL_S = 10;

const waitAsync = ms => new Promise(resolve => setTimeout(resolve, ms));

const queue = async items => items.length
    ? items.shift()().then(() => queue(items))
    : null;

const main = async () => {
  const appList = process.argv.slice(2);
  const tasks = appList.map(app => async () => {
    if (!fs.existsSync(`../apps/${app}`)) {
      throw new Error(`App does not exist: ${app}`);
    }

    spawn(`cd ../apps/${app} && npm start`, { stdio: 'inherit', shell: true });
    await waitAsync(INTERVAL_S * 1000);
  });

  await queue(tasks);
  console.log(`\nRunning ${appList.join(', ')}`);
};

main();
