const {
  requestAsync, log, extract, attic,
} = require('../node-common')(['requestAsync', 'log', 'extract', 'attic']);

/**
 * Log a scraped value from a web page.
 *
 * @param {Object} args - plugin ARGS object.
 */
module.exports = async (args) => {
  const { URL, BEFORES, AFTER, ATTIC_KEY } = args;
  const configured = URL && BEFORES && AFTER && ATTIC_KEY;
  log.assert(configured, 'web-datalogger.js requires some ARGS specified', true);

  try {
    const { body } = await requestAsync({ url: URL });
    const value = extract(body, BEFORES, AFTER).trim();

    let history = [];
    if (await attic.exists(ATTIC_KEY)) {
      history = await attic.get(ATTIC_KEY);
    }

    history.push(value);
    await attic.set(ATTIC_KEY, history);
    log.info(`Logged '${value}' from ${URL}`);
  } catch (e) {
    log.error(`GET ${URL} error:`);
    log.error(e);
  }
};
