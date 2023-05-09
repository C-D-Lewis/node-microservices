/**
 * Import modules directly from the node-common project in this repo.
 *
 * @param {string[]} list - Array of modules names.
 * @returns {object[]} Array of loaded modules.
 */
module.exports = (list) => list.reduce((acc, item) => ({
  ...acc,
  [item]: require(`${__dirname}/../../../node-common/src/modules/${item}`),
}), {});
