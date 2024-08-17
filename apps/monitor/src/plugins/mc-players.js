const { readFileSync } = require('fs');
const { log } = require('../node-common')(['log']);
const { updateMetrics } = require('../modules/metrics');

const JOINED_TAG = 'joined the game';
const LEFT_TAG = 'left the game';

/**
 * Log metrics for logging Minecraft players online.
 *
 * @param {object} args - Plugin args.
 */
module.exports = async (args = {}) => {
  const { LOG_PATH = '/home/pi/hom-mc-server.log' } = args;
  try {
    const mcPlayers = [];

    // Load log file
    const lines = readFileSync(LOG_PATH, 'utf-8')
      .split('\n')
      .map((p) => p.trim())
      .filter((p) => p.includes(JOINED_TAG) || p.includes(LEFT_TAG))
      .map((p) => p.split(': ')[1]);

    // Get all names mentioned
    const names = lines.reduce((acc, p) => {
      const [name] = p.split(' ');
      return acc.includes(name) ? acc : [...acc, name];
    }, []);
    log.debug(`Found MC players: ${names.join(', ')}`);

    // Determine who's still there
    names.forEach((p) => {
      const joinCount = lines.filter((l) => l.includes(p) && l.includes(JOINED_TAG)).length;
      const leftCount = lines.filter((l) => l.includes(p) && l.includes(LEFT_TAG)).length;

      if (joinCount > leftCount) mcPlayers.push(p);
    });

    updateMetrics({ mcPlayers });
  } catch (e) {
    log.error(e);
  }
};
