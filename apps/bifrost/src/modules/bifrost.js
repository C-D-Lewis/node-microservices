/** Colors that could appear in the bifrost log */
const BIFROST_COLORS = [
  'black',
  'black',
  'black',
  'black',
  'black',
  'black',
  'black',
  'black',
  'red',
  'green',
  'yellow',
  'blue',
  'magenta',
  'cyan',
  'white',
  'gray',
  'brightRed',
  'brightGreen',
  'brightYellow',
  'brightYellow',
  'brightYellow',
  'brightYellow',
  'brightYellow',
  'brightBlue',
  'brightMagenta',
  'brightCyan',
  'brightWhite',
];

/**
 * Print a pretty bifrost!
 */
const openTheBifrost = () => {
  const decorLength = 80;
  const stepLength = 2;
  for (let line = 0; line < 3; line += 1) {
    for (let x = 0; x < decorLength; x += stepLength) {
      const colorIndex = Math.floor(Math.random() * BIFROST_COLORS.length);
      const char = Math.random() > 0.5 ? '-' : '\u254D';
      process.stdout.write(char[BIFROST_COLORS[colorIndex]].repeat(stepLength));
    }
    process.stdout.write('\n');
  }
};

module.exports = { openTheBifrost };
