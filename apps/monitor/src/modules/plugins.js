const { config, log } = require('../node-common')(['config', 'log']);

config.addPartialSchema({
  required: ['PLUGINS'],
  properties: {
    PLUGINS: { type: 'array', items: { type: 'object' } },
  },
});

const { PLUGINS } = config.get(['PLUGINS']);

/**
 * @typedef {object} PluginConfig
 * @property {string} [FILE_NAME] - Filename of the plugin to load from ./plugins.
 * @property {string} [USE] - Module name of the plugin to load from ./plugins.
 * @property {number} [EVERY] - If set, run the plugin every N minutes.
 * @property {string} [AT] - If set, run the plugin at the specified time (HH:MM).
 * @property {boolean} [ENABLED] - Whether the plugin is enabled (default: true).
 * @property {object} [ARGS] - Arguments to pass to the plugin function.
 */

/**
 * Array of loaded plugins.
 *
 * @type {Array<{name: string, func: Function, data: PluginConfig}>}
 */
const plugins = [];

/**
 * Run a plugin now.
 *
 * @param {object} plugin - The plugin object.
 */
const runPlugin = async (plugin) => {
  const { name, func, data } = plugin;

  log.info(`Running ${name}`);
  try {
    await func(data.ARGS);
  } catch (e) {
    log.error(`Failed to run plugin function: ${name}`);
    log.error(e);
  }
};

/**
 * Load all plugins in config.
 */
const loadAll = () => {
  PLUGINS.forEach(async (item) => {
    const {
      EVERY, AT, FILE_NAME, USE, ENABLED, ARGS,
    } = item;

    // Verify plugin config
    log.assert(!(EVERY && AT), 'Plugin must have only EVERY or AT, not both', true);
    log.assert(!(FILE_NAME && USE), 'Plugin must have only FILE_NAME or USE, not both', true);

    // Enabled is 'true' by default if included in PLUGINS list
    if (ENABLED === false) {
      log.info(`DISABLED: ${JSON.stringify(item)}`);
      return;
    }

    // Load plugins and store
    const func = (FILE_NAME)
      ? require(`../plugins/${FILE_NAME}`)
      : require(`../plugins/${USE}`);
    const name = FILE_NAME || USE;
    plugins.push({ name, func, data: item });

    // Announce schedule or run immediately
    if (item.EVERY) {
      log.info(`EVERY ${EVERY}: ${JSON.stringify(item)}`);
    } else if (item.AT) {
      log.info(`AT ${AT}: ${JSON.stringify(item)}`);
    } else {
      // Run immediately
      log.info(`ONCE: ${JSON.stringify(item)}`);
      await func(ARGS);
    }
  });

  // Use one timer to iterate all plugins every minute, sequentially
  setInterval(async () => {
    const now = new Date();
    const [hours, mins] = [now.getHours(), now.getMinutes()];

    // eslint-disable-next-line no-restricted-syntax
    for (const p of plugins) {
      const { data } = p;
      if (data.EVERY && (mins % data.EVERY === 0)) await runPlugin(p);

      if (data.AT && now.getSeconds() === 0) {
        const [atHours, atMins] = data.AT.split(':').map((x) => parseInt(x, 10));
        if (atHours === hours && atMins === mins) await runPlugin(p);
      }
    }
  }, 60 * 1000);
};

module.exports = { loadAll };
