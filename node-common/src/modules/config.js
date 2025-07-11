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
const configSchema = { properties: {} };

const getAppName = () => {
  const line = process.argv.find((p) => p.includes('/apps/'));
  const parts = line.split('/');

  // Before /src/main.js
  return parts[parts.length - 3];
};

const appName = getAppName();

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
    console.log('No config-default.yml available!');
    return;
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

  addFragment(partial, configSchema[appName]);
};

/**
 * Validate all schema assemnbled in require phase and return requested.
 *
 * @param {Array<string>} names - Top-level config names.
 * @returns {object} Object of requested config.
 */
const get = (names) => names.reduce((acc, name) => {
  const appConfig = configSchema[appName];
  if (!appConfig) throw new Error(`No config schema for app: ${appName}`);

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
  if (!appName) throw new Error('appName is required for validation.');

  // Schema valid?
  if (!schema(config[appName], configSchema[appName])) throw new Error('Schema failed validation.');

  // Redundant keys?
  deepCompareKeys(configSchema, config);

  if (verbose) console.log(JSON.stringify(configSchema, null, 2));
};

/**
 * Set the app's name for config reading.
 *
 * @param {string} name - Name of the app.
 */
const setAppName = (name) => {
  appName = name;
};

ensureConfigFile();

module.exports = {
  getInstallPath,
  addPartialSchema,
  get,
  validate,
  setAppName,
};
