const {
  log, enviro, attic,
} = require('../node-common')(['log', 'enviro', 'attic']);

module.exports = async (args) => {
  const { ATTIC_KEY } = args;
  const configured = ATTIC_KEY;
  log.assert(configured, 'web-datalogger.js requires some ARGS specified', true);

  try {
    const sample = enviro.readAll();
    const value = {
      ...sample,
      timestamp: Date.now(),
    };

    let history = [];
    if (await attic.exists(ATTIC_KEY)) {
      history = await attic.get(ATTIC_KEY);
    }

    history.push(value);
    await attic.set(ATTIC_KEY, history);
    log.info(`Logged '${JSON.stringify(value)}' from enviro`);
  } catch (e) {
    log.error(e);
  }
};
