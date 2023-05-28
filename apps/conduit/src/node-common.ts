/**
 * Import modules directly from the node-common project in this repo.
 *
 * @param {string[]} list - Array of modules names.
 * @returns {object[]} Array of loaded modules.
 */
const common = (list) => list.reduce((acc, item) => ({
  ...acc,
  [item]: require(`${__dirname}/../../../node-common/src/modules/${item}`),
}), {});

export default common;
