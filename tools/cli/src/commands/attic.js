const { send } = require('./conduit');

/**
 * Get a value from the attic DB.
 *
 * @param {string} app - App name that owns the data.
 * @param {string} key - Key for the value.
 */
const get = async (app, key) => {
  const packet = {
    to: 'attic',
    topic: 'get',
    message: { app, key },
  };
  const res = await send({ packet });
  console.log(res.message.value);
};

/**
 * Set a value in the attic DB.
 *
 * @param {string} app - App name that owns the data.
 * @param {string} key - Key for the value.
 * @param {string} value - The value itself.
 */
const set = async (app, key, value) => {
  const packet = {
    to: 'attic',
    topic: 'set',
    message: { app, key, value },
  };
  const res = await send({ packet });
  if (res.status !== 200) throw new Error(res);

  console.log(`Set '${key}' to '${value}'`);
};

module.exports = {
  firstArg: 'attic',
  description: 'Work with the attic app.',
  operations: {
    setValue: {
      /**
       * Set a value.
       *
       * @param {Array<string>} args - Command args.
       * @returns {Promise<void>}
       */
      execute: async ([, app, key, value]) => set(app, key, value),
      pattern: 'set $app $key $value',
    },
    getValue: {
      /**
       * Get a value.
       *
       * @param {Array<string>} args - Command args.
       * @returns {Promise<void>}
       */
      execute: async ([, app, key]) => get(app, key),
      pattern: 'get $app $key',
    },
  },
};
