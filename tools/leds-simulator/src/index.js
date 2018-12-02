const { conduit } = require('@chris-lewis/node-common')(['conduit']);
const chalk = require('chalk');

const INTERVAL_MS = 500;

const updateDisplay = (ledArr) => {
  process.stdout.clearLine();
  process.stdout.cursorTo(0);
  ledArr.forEach((led) => {
    const [r, g, b] = led;
    process.stdout.write(chalk.rgb(r, g, b)('\u25C9 '));
  });
};

const main = async () => {
  await conduit.register();

  setInterval(async () => {
    const packet = { to: 'LedServer', topic: 'state', message: {}};
    const state = await conduit.send(packet);

    updateDisplay(state.message.leds);
  }, INTERVAL_MS);
};

main();
