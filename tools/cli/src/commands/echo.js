module.exports = {
  firstArg: 'echo',
  description: 'An example command that echos args.',
  operations: {
    echoArg: {
      /**
       * Echo a value.
       *
       * @param {Array<string>} args - Command args
       * @returns {Promise<void>}
       */
      execute: async ([value]) => console.log(`Value was: ${value}`),
      pattern: '$value',
    },
  },
};
