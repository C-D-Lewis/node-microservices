/** All available switches */
const SWITCH_LIST = [
  {
    name: '--host',
    about: 'Specify a host for this command.',
    constant: 'HOST',
    valueLabel: '<url>',
  },
  {
    name: '--token',
    about: 'Specify an auth token if required.',
    constant: 'TOKEN',
    valueLabel: '<token>',
  },
  {
    name: '--verbose',
    about: 'Show launched app logs',
    constant: 'VERBOSE',
  },
];

/**
 * Extract and store switches.
 *
 * @param {Array<string>} args - Program arguments.
 * @returns {Array<string>} Program arguments, minus switches and switch values.
 */
const extract = (args) => {
  args
    .filter((p) => p.includes('--'))
    .forEach((arg) => {
      const valid = SWITCH_LIST.find(({ name }) => name === arg);
      if (!valid) throw new Error(`Invalid switch: ${arg}.\nType 'nms' to see a list of available switches.`);

      const foundIndex = args.indexOf(arg);
      const { constant, valueLabel } = valid;

      // Export it
      module.exports[constant] = valueLabel ? args[foundIndex + 1] : true;

      args.splice(foundIndex, valueLabel ? 2 : 1);
    });

  return args;
};

module.exports = {
  SWITCH_LIST,
  extract,
};
