/**
 * Execute the nominated file (single function export) with PARAMS as its parameters.
 * The file may return an asynchronous function, and must live in src/executeScripts.
 *
 * @param {Object} args - plugin ARGS object.
 */
module.exports = async (args) => {
  const { EXECUTE_SCRIPT, PARAMS } = args;

  const func = require(`${__dirname}/../executeScripts/${EXECUTE_SCRIPT}`);
  await func(PARAMS);
};
