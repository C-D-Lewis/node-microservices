/* eslint-disable no-param-reassign */
const fetch = require('node-fetch');

/**
 * Generic request function.
 *
 * @param {string | object} opts - Request options.
 * @returns {{ response, body, data }} Request result.
 */
module.exports = async (opts) => {
  if (opts.json) throw new Error('.json not available');

  // Could be url or opts
  let finalUrl = opts;
  if (opts.url) {
    finalUrl = opts.url;
    delete opts.url;
  }

  // Magic headers
  if (opts.method && ['POST', 'PUT'].includes(opts.method.toUpperCase())) {
    opts.headers = opts.headers || {};
    opts.headers['Content-Type'] = 'application/json';
  }

  const finalOpts = finalUrl === opts ? undefined : opts;
  const res = await fetch(finalUrl, finalOpts);
  const body = await res.text();

  // JSON?
  let data;
  try {
    data = JSON.parse(body);
  } catch (e) { /* Not JSON */ }

  // Return specific data
  return {
    status: res.status,
    body,
    data,
  };
};
