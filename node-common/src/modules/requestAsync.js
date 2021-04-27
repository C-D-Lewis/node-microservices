const fetch = require('node-fetch');

module.exports = async (opts) => {
  const { url, ...rest } = opts;
  const res = await fetch(url, rest);
  const body = await res.json();

  // As of 27/4/21, seems 'response' is not currently used
  return { body };
};
