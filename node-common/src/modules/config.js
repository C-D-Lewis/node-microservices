/* eslint-disable no-param-reassign */

const { execSync } = require('child_process');
const fs = require('fs');
const yaml = require('yaml');
const schema = require('./schema');
require('colors');

/**
 * Get app install path.
 *
 * @returns {string} The output from `pwd` in this process.
 */
const getInstallPath = () => execSync('pwd').toString().trim();

/** Path of the example config */
const DEFAULT_PATH = `${__dirname}/../../../config-default.yml`;
/** Path of the actual config */
const CONFIG_PATH = `${__dirname}/../../../config.yml`;

let config = {};
const fullSchema = { properties: {} };

/**
 * Get the app name from the process arguments.
 *
 * @returns {string} The name of the app.
 */
const getAppName = () => {
  const line = process.argv.find((p) => p.includes('/apps/'));
  if (!line) {
    throw new Error('Could not determine app name from process arguments. Ensure you are running an app from the /apps directory.');
  }

  const parts = line.split('/');
  const appsIndex = parts.indexOf('apps');

  // Before /src/main.js
  return parts[appsIndex + 1];
};

// Tests should pre-set the app name.
const appName = process.env.TEST_APP_NAME || getAppName();

/**
 * Compare expected keys with those present.
 *
 * @param {object} spec - JSON schema fragment.
 * @param {object} data - Data to compare.
 * @param {Array<string>} [parents] - Parent keys, if any.
 * @throws {Error} if not consistent.
 */
const deepCompareKeys = (spec, data, parents = []) => {
  const specKeys = Object.keys(spec.properties);
  const dataKeys = Object.keys(data);

  specKeys.forEach((s) => {
    const thisSpec = spec.properties[s];

    // This spec has all required keys
    if (!dataKeys.includes(s)) {
      console.log(`Missing config: ${parents.join(' > ')} > ${s}`.yellow);
    }

    // Go deeper?
    if (thisSpec.properties) {
      deepCompareKeys(thisSpec, data[s], [...parents, s]);
    }
  });

  // If not top-level, check for unexpected
  dataKeys.forEach((d) => {
    if (!specKeys.includes(d)) {
      console.log(
        `Unexpected config: ${parents.join(' > ')} > ${d}: ${JSON.stringify(data[d])}`.yellow,
      );
    }
  });
};

/**
 * Ensure a config file exists.
 */
const ensureConfigFile = () => {
  if (fs.existsSync(CONFIG_PATH)) {
    config = yaml.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
    console.log('Loaded config.yml');
    return;
  }

  // Create from default.
  if (!fs.existsSync(DEFAULT_PATH)) {
    throw new Error('No config-default.yml available!');
  }

  const defaultConfig = yaml.parse(fs.readFileSync(DEFAULT_PATH, 'utf8'));
  fs.writeFileSync(CONFIG_PATH, yaml.stringify(defaultConfig, null, 2), 'utf8');
  console.log('Set up new config.yml from config-default.yml - may require additional configuration.');
  config = defaultConfig;
};

/**
 * Add a fragment of config.
 *
 * @param {object} partial - Partial config to add.
 * @param {object} parentSpec - Parent at this level to add it to.
 * @param {string} [parentKey] - Parent key.
 */
const addFragment = (partial, parentSpec, parentKey) => {
  // Simple type
  if (!partial.properties) {
    parentSpec.properties[parentKey] = partial;
    return;
  }

  // Object type
  Object.entries(partial.properties).forEach(([prop, propSpec]) => {
    // New property
    if (!parentSpec.properties[prop]) {
      parentSpec.properties[prop] = propSpec;
      return;
    }

    // Exists, but simple type
    if (!propSpec.properties) return;

    // Exists with sub-properties, merge them
    Object.entries(propSpec.properties).forEach(([childK, childSpec]) => {
      // Add child simple type
      if (!childSpec.properties) {
        parentSpec.properties[prop].properties[childK] = childSpec;
        return;
      }

      // Add deeper object spec
      addFragment(childSpec.properties, parentSpec.properties[prop], childK);
    });
  });
};

/**
 * Add a partial schema to the app's config ready for validate().
 *
 * @param {object} partial - Partial schema to add, from top-level perspective.
 * @returns {void}
 */
const addPartialSchema = (partial) => {
  if (!appName) throw new Error('appName is required to add a partial schema.');

  // First time seeing this app?
  if (!fullSchema[appName]) {
    fullSchema[appName] = { properties: {} };
  }

  addFragment(partial, fullSchema[appName]);
};

/**
 * Get the app's config schema.
 *
 * @returns {object} The app's config schema.
 */
const getAppConfig = () => {
  if (!appName) throw new Error('appName is required to get app config.');

  const appConfig = config[appName];
  if (!appConfig) throw new Error(`No config schema for app: ${appName}`);

  return appConfig;
};

/**
 * Get a config object for the app based on a key or keys.
 *
 * @param {Array<string>} names - App-level config names.
 * @returns {object} Object of requested config.
 */
const get = (names) => names.reduce((acc, name) => {
  const appConfig = getAppConfig();

  if (!appConfig[name]) throw new Error(`Unknown config name: ${name} (looking for ${names.join(', ')})`);

  return { ...acc, [name]: appConfig[name] };
}, {});

/**
 * Validate built schema after all modules are required. Currently must be done
 * manually as part of app launch.
 *
 * @param {object} opts - Options.
 * @param {boolean} [opts.verbose] - Log details.
 * @throws {Error} if validation fails.
 */
const validate = ({ verbose } = {}) => {
  const appConfig = getAppConfig();
  const appSchema = fullSchema[appName];

  // Schema valid?
  if (!schema(appConfig, appSchema)) throw new Error('Schema failed validation.');

  // Redundant keys?
  deepCompareKeys(appSchema, appConfig);

  if (verbose) console.log(JSON.stringify(fullSchema, null, 2));
};

ensureConfigFile();

module.exports = {
  getInstallPath,
  addPartialSchema,
  get,
  validate,
};
