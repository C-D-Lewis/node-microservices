const { config, log } = require('../node-common')(['config', 'log']);

config.requireKeys('plugins.js', {
  required: ['PLUGINS'],
  properties: {
    PLUGINS: { type: 'array', items: { type: 'object' } },
  },
});

const handleAt = (pluginName, when, updateCb) => {
  setInterval(() => {
    const now = new Date();
    if(now.getHours() !== parseInt(when.substring(0, 2))) return;
    if(now.getMinutes() !== parseInt(when.substring(3, 5))) return;
    if(now.getSeconds() !== 0) return;

    log.info(`Running ${pluginName}`);
    updateCb();
  }, 1000);
};

const loadAll = () => {
  config.PLUGINS.forEach((plugin) => {
    // Verify plugin config
    log.assert(!(plugin.EVERY && plugin.AT), 'Plugin must have only EVERY or AT, not both', true);
    log.assert(!(plugin.FILE_NAME && plugin.USE), 'Plugin must have only FILE_NAME or USE, not both', true);
    if(!plugin.ENABLED) return;

    // Load plugin
    let callback;
    const pluginName = plugin.FILE_NAME ? plugin.FILE_NAME : plugin.USE;
    if(plugin.FILE_NAME) callback = require(`../plugins/${plugin.FILE_NAME}`);
    if(plugin.USE) {
      log.assert(plugin.ARGS, 'USE plugin must specify ARGS to act on', true);
      callback = require(`../plugins/${plugin.USE}`);
    }

    // Start plugin
    log.info(`Loaded plugin ${JSON.stringify(plugin)}`);
    const args = plugin.ARGS;
    if(plugin.EVERY) { 
      setInterval(() => {
        log.info(`Running ${pluginName}`);
        callback(args);
      }, plugin.EVERY * 60 * 1000); 
      callback(args);
      return;
    } 

    if(plugin.AT) {
      handleAt(pluginName, plugin.AT, () => callback(args));
      return;
    }

    log.error(`Unable to schedule plugin: ${JSON.stringify(plugin)}`);
  });
};

module.exports = { loadAll };
