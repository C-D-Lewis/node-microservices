const { conduit } = require('@chris-lewis/node-common')(['conduit']);
const chalk = require('chalk');

const INTERVAL_MS = 500;

const updateDisplay = (ledArr) => {
  process.stdout.clearLine();
  process.stdout.cursorTo(0);
  ledArr.forEach(led => process.stdout.write(chalk.rgb(...led)('\u25C9 ')));
};

const main = async () => {
  await conduit.register();

  setInterval(async () => {
    const state = await conduit.send({ to: 'LedServer', topic: 'state', message: {}});
    updateDisplay(state.message.leds);
  }, INTERVAL_MS);
};

main();
