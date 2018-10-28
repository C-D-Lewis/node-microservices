module.exports = list => list.reduce((result, item) => {
  result[item] = require(`${__dirname}/modules/${item}`);

  return result;
}, {});
