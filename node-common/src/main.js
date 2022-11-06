/**
 * Root module for node-common.
 *
 * @param {Array<string>} list - List of module names.
 * @returns {*} Named exports.
 */
module.exports = (list) => list.reduce((result, item) => ({
  ...result,
  [item]: require(`${__dirname}/modules/${item}`),
}), {});
