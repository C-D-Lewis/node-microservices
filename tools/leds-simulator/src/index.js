const { conduit } = require('./node-common')(['conduit']);
const chalk = require('chalk');

const INTERVAL_MS = 1000;

const updateDisplay = (ledArr, textArr) => {
  console.clear();

  // LEDs
  process.stdout.cursorTo(0);
  ledArr.forEach(led => process.stdout.write(chalk.rgb(...led)('\u25C9 ')));

  // Text lines
  textArr.forEach((p) => {
    process.stdout.write('\n');
    process.stdout.write(p);
  });
};

const main = async () => {
  await conduit.register({ appName: 'leds-simulator' });

  setInterval(async () => {
    try {
      const state = await conduit.send({ to: 'visuals', topic: 'state' }, { silent: true });
      updateDisplay(state.message.leds, state.message.text);
    } catch (e) {
      console.log('Disconnected');
    }
  }, INTERVAL_MS);
};

main();
