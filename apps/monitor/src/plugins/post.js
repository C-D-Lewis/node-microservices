const {
  requestAsync, log
} = require('@chris-lewis/node-common')(['requestAsync', 'log']);

module.exports = async (args) => {
  log.assert(args.URL && args.JSON, 'post.js requires URL and ARGS specified', true);

  try {
    const { body } = await requestAsync({
      url: args.URL,
      method: 'post',
      json: args.JSON
    });

    log.info(`POST ${args.URL} OK`);
    log.debug(body);
  } catch (e) {
    log.error(`POST ${args.URL} ERROR`);
    log.error(e);
  }
};
