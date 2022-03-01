const { config, log } = require('../node-common')(['config', 'log']);

config.requireKeys('plugins.js', {
  required: ['PLUGINS'],
  properties: {
    PLUGINS: { type: 'array', items: { type: 'object' } },
  },
});

/** Interval between checks for handleAt() */
const HANDLE_AT_INTERVAL_MS = 1000;

/**
 * Run a plugin now.
 *
 * @param {string} pluginName - Name of the plugin.
 * @param {object} plugin - The plugin object.
 * @param {Function} pluginFunc - Function to call to call the plugin's code.
 */
const runPlugin = async (pluginName, plugin, pluginFunc) => {
  log.info(`Running ${pluginName}`);
  try {
    await pluginFunc(plugin.ARGS);
  } catch (e) {
    log.error(`Failed to run plugin function: ${pluginName}`);
    log.error(e);
  }
};

/**
 * Handle a plugin specifying an AT time scheme.
 *
 * @param {string} pluginName - Name of the plugin.
 * @param {object} plugin - The plugin object.
 * @param {Function} pluginFunc - Function to call to call the plugin's code.
 */
const handleAt = async (pluginName, plugin, pluginFunc) => {
  // Now?
  if (plugin.AT === 'start') {
    await runPlugin(pluginName, plugin, pluginFunc);
    return;
  }

  // A certain time in the future
  setInterval(async () => {
    const now = new Date();
    const [whenHours, whenMins] = plugin.AT.split(':');
    if (
      now.getHours() !== parseInt(whenHours, 10)
      || now.getMinutes() !== parseInt(whenMins, 10)
      || now.getSeconds() !== 0
    ) {
      return;
    }

    await runPlugin(pluginName, plugin, pluginFunc);
  }, HANDLE_AT_INTERVAL_MS);
  log.info(`AT ${plugin.AT}: ${JSON.stringify(plugin)}`);
};

/**
 * Handle a plugin specifying an EVERY time scheme.
 *
 * @param {string} pluginName - Name of the plugin.
 * @param {object} plugin - The plugin object.
 * @param {Function} pluginFunc - Function to call to call the plugin's code.
 */
const handleEvery = (pluginName, plugin, pluginFunc) => {
  setInterval(async () => {
    log.info(`Running ${pluginName}`);
    try {
      await pluginFunc(plugin.ARGS);
    } catch (e) {
      log.error(`Failed to run plugin function: ${pluginName}`);
      log.error(e);
    }
  }, plugin.EVERY * 60 * 1000);
  log.info(`EVERY ${plugin.EVERY}: ${JSON.stringify(plugin)}`);
};

/**
 * Load all plugins in config.
 */
const loadAll = () => {
  config.PLUGINS.forEach(async (plugin) => {
    // Verify plugin config
    log.assert(!(plugin.EVERY && plugin.AT), 'Plugin must have only EVERY or AT, not both', true);
    log.assert(!(plugin.FILE_NAME && plugin.USE), 'Plugin must have only FILE_NAME or USE, not both', true);
    if (!plugin.ENABLED) {
      return;
    }

    // Load plugins and register timers
    const pluginFunc = (plugin.FILE_NAME)
      ? require(`../plugins/${plugin.FILE_NAME}`)
      : require(`../plugins/${plugin.USE}`);
    const pluginName = plugin.FILE_NAME ? plugin.FILE_NAME : plugin.USE;

    if (plugin.EVERY) {
      handleEvery(pluginName, plugin, pluginFunc);
      return;
    }

    if (plugin.AT) {
      await handleAt(pluginName, plugin, pluginFunc);
      return;
    }

    log.error(`Unable to schedule plugin: ${JSON.stringify(plugin)}`);
  });
};

module.exports = { loadAll };
