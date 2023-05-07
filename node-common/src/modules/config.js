/* eslint-disable no-param-reassign */

const { execSync } = require('child_process');
const fs = require('fs');
const schema = require('./schema');

/**
 * Get app install path.
 *
 * @returns {string} The output from `pwd` in this process.
 */
const getInstallPath = () => execSync('pwd').toString().trim();

/** Path of the example config */
const DEFAULT_PATH = `${getInstallPath()}/config-default.json`;
/** Path of the actual config */
const CONFIG_PATH = `${getInstallPath()}/config.json`;

let config = {};
const builtSchema = { properties: {} };

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
    // This spec has all required keys
    if (!dataKeys.includes(s)) {
      throw new Error(`Missing config: ${parents.join(' > ')} > ${s}`);
    }

    // Go deeper?
    if (spec.properties[s].properties) {
      deepCompareKeys(spec.properties[s], data[s], [...parents, s]);
    }
  });

  // If not top-level, check for unexpected (does not work with partial schemas)
  if (parents.length) {
    dataKeys.forEach((d) => {
      if (!specKeys.includes(d)) {
        console.log(
          `Unexpected config: ${parents.join(' > ')} > ${d}: ${JSON.stringify(data[d])}`,
        );
      }
    });
  }
};

/**
 * Ensure a config file exists.
 */
const ensureConfigFile = () => {
  if (fs.existsSync(CONFIG_PATH)) {
    config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
    console.log('Loaded config.json');
    return;
  }

  // Create from default.
  if (!fs.existsSync(DEFAULT_PATH)) {
    console.log('No config-default.json available!');
    return;
  }

  const defaultConfig = JSON.parse(fs.readFileSync(DEFAULT_PATH, 'utf8'));
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(defaultConfig, null, 2), 'utf8');
  console.log('Set up new config.json from config-default.json - may require additional configuration.');
};

ensureConfigFile();

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
  Object.entries(partial.properties).forEach(([k, spec]) => {
    // New property
    if (!parentSpec.properties[k]) {
      parentSpec.properties[k] = spec;
      return;
    }

    // Exists, but simple type
    if (!spec.properties) return;

    // Exists with sub-properties, merge them
    Object.entries(spec.properties).forEach(([childK, childSpec]) => {
      addFragment(childSpec, parentSpec.properties[k], childK);
    });
  });
};

/**
 * Add a partial schema to the app's config ready for validate().
 *
 * @param {object} partial - Partial schema to add, from top-level perspective.
 * @returns {void}
 */
const addPartialSchema = (partial) => addFragment(partial, builtSchema);

/**
 * Validate all schema assemnbled in require phase and return requested.
 *
 * @param {Array<string>} topLevelNames - Top-level config names.
 * @returns {object} Object of requested config.
 */
const get = (topLevelNames) => {
  // Schema valid?
  if (!schema(config, builtSchema)) throw new Error('Schema failed validation.');

  // Redundant keys?
  deepCompareKeys(builtSchema, config);

  return topLevelNames.reduce((acc, name) => ({ ...acc, [name]: config[name] }), {});
};

// Behave as if we required config.json directly
module.exports = {
  getInstallPath,
  addPartialSchema,
  get,
};

// Self-test
// addPartialSchema({
//   properties: {
//     FOO: { type: 'string' },
//   },
// });
// addPartialSchema({
//   properties: {
//     OBJ: {
//       properties: {
//         A: { type: 'string' },
//       },
//     },
//   },
// });
// addPartialSchema({
//   properties: {
//     LEVEL_1: {
//       properties: {
//         LEVEL_2: {
//           properties: {
//             B: { type: 'string' },
//           },
//         },
//       },
//     },
//   },
// });

// console.log(JSON.stringify(builtSchema, null, 2));
