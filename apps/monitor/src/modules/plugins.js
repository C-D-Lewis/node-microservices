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
 * Handle a plugin specifying an AT time scheme.
 *
 * @param {string} pluginName - Name of the plugin.
 * @param {Object} plugin - The plugin object.
 * @param {Function} pluginFunc - Function to call to call the plugin's code.
 */
const handleAt = (pluginName, plugin, pluginFunc) => {
  setInterval(() => {
    const now = new Date();
    const [whenHours, whenMins] = plugin.AT.split(':');
    if (
      now.getHours() !== parseInt(whenHours) ||
      now.getMinutes() !== parseInt(whenMins) ||
      now.getSeconds() !== 0
      ) {
      return;
    }

    log.info(`Running ${pluginName}`);
    pluginFunc(plugin.ARGS);
  }, HANDLE_AT_INTERVAL_MS);
  log.info(`Plugin ${pluginName} is waiting until ${plugin.AT}`);
};

/**
 * Handle a plugin specifying an EVERY time scheme.
 *
 * @param {string} pluginName - Name of the plugin.
 * @param {Object} plugin - The plugin object.
 * @param {Function} pluginFunc - Function to call to call the plugin's code.
 */
const handleEvery = (pluginName, plugin, pluginFunc) => {
  setInterval(() => {
    log.info(`Running ${pluginName}`);
    pluginFunc(plugin.ARGS);
  }, plugin.EVERY * 60 * 1000);
  log.info(`Plugin ${pluginName} runs every ${plugin.EVERY} minute(s)`);
};

/**
 * Load all plugins in config.
 */
const loadAll = () => {
  config.PLUGINS.forEach((plugin) => {
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
      handleAt(pluginName, plugin, pluginFunc);
      return;
    }

    log.error(`Unable to schedule plugin: ${JSON.stringify(plugin)}`);
  });
};

module.exports = { loadAll };
