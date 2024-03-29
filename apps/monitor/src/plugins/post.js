const { fetch, log } = require('../node-common')(['fetch', 'log']);

/**
 * Send an HTTP POST request.
 *
 * @param {object} args - plugin ARGS object.
 */
module.exports = async (args) => {
  log.assert(args && args.URL && args.JSON, 'post.js requires URL and ARGS specified', true);

  try {
    const { body } = await fetch({
      url: args.URL,
      method: 'post',
      body: JSON.stringify(args.JSON),
    });

    log.info(`POST ${args.URL} OK`);
    log.debug(body);
  } catch (e) {
    log.error(`POST ${args.URL} ERROR`);
    log.error(e);
  }
};
