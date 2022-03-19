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

`);
};

/**
 * The main function.
 */
const main = () => {
  const operation = commands.identify(ARGS);
  if (!operation) {
    printHelp();
    return;
  }

  operation.execute(ARGS.slice(1));

  // nms conduit send $app $topic $message
  // nms conduit apps list

  // nms attic get $app $key
  // nms attic set $app $key $value

  // nms host $hostUrl

  // nms fleet list

  // nms launch $appName
};

main();
