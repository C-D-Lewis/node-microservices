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
const main = () => {
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
    operation.execute(ARGS.slice(1));
  } catch (e) {
    console.log(e);
  }

  // nms conduit send $app $topic $message

  // nms attic get $app $key
  // nms attic set $app $key $value

  // nms fleet list

  // nms app $appName start
  // nms app $appName stop
  // nms app list

  // --host
};

main();
