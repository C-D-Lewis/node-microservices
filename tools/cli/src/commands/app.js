module.exports = {
    firstArg: 'app',
    description: 'Work with apps.',
    operations: {
      launchApp: {
        /**
         * Launch an app.
         *
         * @param {Array<string>} args - Command args
         * @returns {Promise<void>}
         */
        execute: async ([, appName]) => launch(appName),
        pattern: 'launch $appName',
      },
    },
  };
  