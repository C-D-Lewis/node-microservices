/** All commands available. */
const COMMAND_LIST = [
  require('../commands/echo'),
];

/**
 * Match one arg with ability to interpret placeholders.
 *
 * @param {string} patternArg - Single arg from the pattern.
 * @param {string} restArg - Single arg equivalent from the program args.
 * @returns {true} if a match is suitable.
 */
const matchArg = (patternArg, restArg) => {
  // $value can be any value
  if (patternArg === '$value') return restArg.length > 0;

  // Else must match
  return patternArg === restArg;
};

/**
 * Identify which command was selected.
 *
 * @param {Array<string>} args - Program arguments.
 * @returns {object|undefined} Identified command, if any.
 */
const identify = (args) => {
  const [firstArg, ...rest] = args;

  // Find the command by firstArg
  const foundCmd = COMMAND_LIST.find(c => c.firstArg === firstArg);
  if (!foundCmd) throw new Error(`Command '${firstArg}' not found`);

  // Find the operation with pattern matching the remaining args
  const [, operation] = Object
    .entries(foundCmd.operations)
    .find(([name, { pattern }]) => {
      const patternArgs = pattern.split(' ');

      // Every arg in the pattern must match a program arg
      if (!patternArgs.every((pArg, i) => matchArg(pArg, rest[i]))) return;

      return name;
    });

  return operation;
};

module.exports = {
  identify,
};
