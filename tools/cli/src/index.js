require('colors');

const { description } = require('../package.json');
const commands = require('./modules/commands');

/** Program args */
const ARGS = process.argv.slice(2);

/**
 * Print help text.
 */
const printHelp = () => {
  console.log(`
nms-cli - ${description}

Commands:
${Object.entries(commands.COMMAND_LIST).map(([, { firstArg, description }]) => `  ${firstArg} - ${description}`)}
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
    console.log(`Error: ${e.message}`.red);
  }

  // nms conduit send $app $topic $message

  // nms attic get $app $key
  // nms attic set $app $key $value

  // nms fleet list

  // --host
};

main();
