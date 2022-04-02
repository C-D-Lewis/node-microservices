require('colors');

const pkg = require('../package.json');
const commands = require('./modules/commands');

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
`);
};

/**
 * The main function.
 */
const main = async () => {
  const operation = commands.identify(ARGS);

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
    await operation.execute(ARGS.slice(1));
  } catch (e) {
    console.log(`Error: ${e.stack}`.red);
  }

  // --host
};

main();
