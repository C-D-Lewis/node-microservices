const {
  requestAsync, log, extract, attic,
} = require('../node-common')(['requestAsync', 'log', 'extract', 'attic']);

module.exports = async (args) => {
  const configured = args.URL && args.BEFORES && args.AFTER && args.ATTIC_KEY;
  log.assert(configured, 'datalogger.js requires ARGS specified', true);

  try {
    const { body } = await requestAsync({ url: args.URL });
    const value = extract(body, args.BEFORES, args.AFTER).trim();
    
    let values = [];
    if (await attic.exists(args.ATTIC_KEY)) {
      values = await attic.get(args.ATTIC_KEY);
    }
    
    values.push(value);
    await attic.set(args.ATTIC_KEY, values);
    log.info(`Logged '${value}' from ${args.URL}`);
  } catch (e) {
    log.error(`GET ${args.URL} ERROR`);
    log.error(e);
  }
};
