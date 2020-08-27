const { conduit } = require('./node-common')(['conduit']);
const chalk = require('chalk');

const INTERVAL_MS = 1000;

const updateDisplay = (ledArr) => {
  process.stdout.clearLine();
  process.stdout.cursorTo(0);
  ledArr.forEach(led => process.stdout.write(chalk.rgb(...led)('\u25C9 ')));
};

const main = async () => {
  await conduit.register();

  setInterval(async () => {
    try {
      const state = await conduit.send({ to: 'visuals', topic: 'state' });
      updateDisplay(state.message.leds);
    } catch (e) {
      console.log('Disconnected');
    }
  }, INTERVAL_MS);
};

main();
