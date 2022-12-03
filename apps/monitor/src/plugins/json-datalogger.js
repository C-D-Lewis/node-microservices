const jsonPath = require('jsonpath');
const fs = require('fs');
const {
  requestAsync, log,
} = require('../node-common')(['requestAsync', 'log']);

/**
 * Log a JSON value from an API to CSV
 *
 * @param {object} args - plugin ARGS object.
 */
module.exports = async (args) => {
  const {
    URL, JSON_PATH, OUTPUT_FILE,
  } = args;
  log.assert(
    URL && JSON_PATH && OUTPUT_FILE,
    'json-datalogger.js requires some ARGS specified',
    true,
  );

  try {
    const { body } = await requestAsync({
      url: URL,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:107.0) Gecko/20100101 Firefox/107.0',
      },
    });
    const json = JSON.parse(body);
    const value = jsonPath.query(json, JSON_PATH);
    const now = Date.now();

    // Write CSV file
    let stream;
    if (!fs.existsSync(OUTPUT_FILE)) {
      // New file, add headers too
      stream = fs.createWriteStream(OUTPUT_FILE, { flags: 'w' });
      stream.end('"timestamp","value"\n');
    }

    stream = fs.createWriteStream(OUTPUT_FILE, { flags: 'a' });
    stream.end(`"${now}","${value}"\n`);

    log.info(`Logged '${value}' from ${URL}`);
  } catch (e) {
    log.error(`GET ${URL} error:`);
    log.error(e);
  }
};
