require('colors');

const pkg = require('../package.json');
const commands = require('./modules/commands');
const switches = require('./modules/switches');

/** Program args */
const ARGS = process.argv.slice(2);

/**
 * Print help text.
 */
const printHelp = () => {
  console.log(`
nms-cli - ${pkg.description}

Commands:
${Object.entries(commands.COMMAND_LIST).map(([, { firstArg, description }]) => `  ${firstArg} - ${description}`).join('\n')}

Switches:
${switches.SWITCH_LIST.map(({ name, valueLabel, about }) => `  ${name}${valueLabel ? ` ${valueLabel}` : ''} ${about}`).join('\n')}
`);
};

/**
 * The main function.
 */
const main = async () => {
  const initialArgs = [...ARGS];
  const commandArgs = switches.extract(initialArgs);
  const operation = commands.identify(commandArgs);

  // No command matched, print all
  if (!operation) {
    printHelp();
    return;
  }

  // Command matched, but no operation matched
  if (operation.partial) {
    commands.printOperations(operation.foundCmd);
    return;
  }

  // Run the command operation
  try {
    await operation.execute(commandArgs.slice(1));
  } catch (e) {
    console.log(`Error: ${e.stack}`.red);
  }
};

main();
