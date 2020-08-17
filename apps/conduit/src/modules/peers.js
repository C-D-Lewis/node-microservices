/**
 * Allow conduit to assess and launch apps on known peer devices.
 */

const { config, log, requestAsync } = require('../node-common')(['config', 'log', 'requestAsync']);
const { readdirSync } = require('fs');

config.requireKeys('fleet.js', {
  required: ['OPTIONS'],
  properties: {
    OPTIONS: {
      required: ['PEERS', 'TASKS'],
      properties: {
        PEERS: {
          type: 'array',
          items: { type: 'string' },
        },
        TASKS: {
          type: 'array',
          items: { type: 'string' },
        },
      },
    },
  },
});

const { PEERS, TASKS } = config.OPTIONS;
const KNOWN_TASKS = readdirSync(`${__dirname}/../../..`);

/**
 * Get the app list of a given peer.
 *
 * @param {string} ip - IP to query for conduit.
 * @returns {Object[]} Array of app names and statuses.
 */
const getPeerApps = async (ip) => {
  const status = await requestAsync(`http://${ip}:${config.SERVER.PORT}/apps`)
    .then(({ body }) => JSON.parse(body));
  return { ip, status };
};

/**
 * Identify tasks, peers, and put them to work.
 */
const placeTasks = async () => {
  if (!TASKS.length) {
    log.info('No tasks specified to be placed.');
    return;
  }

  if (!TASKS.every(p => KNOWN_TASKS.includes(p))) {
    throw new Error('Not all configured tasks are known.');
  }
  if (TASKS.length && !PEERS.length) {
    throw new Error('Tasks specified, but no known peers to run them on.');
  }

  // Can the peers be reached?
  let peerStatuses;
  try {
    log.info(`Looking for peers ${PEERS.join(', ')}`);
    peerStatuses = await Promise.all(PEERS.map(getPeerApps));
  } catch (err) {
    log.error(err);
    log.error('Not all peers are reachable');
  }
  log.info(`Peer tasks: ${TASKS.join(', ')}`);

  // Are the tasks already running?
  const runningApps = peerStatuses
    .map(p => p.status.reduce((acc, q) => [...acc, q.app], []))
    .reduce((acc, p) => [...acc, ...p], []);
  const runningAppList = [...new Set(runningApps)];

  if (TASKS.every(p => runningApps.includes(p))) {
    log.info('All tasks running on peers');
    return;
  }

  // Place new tasks spread over available peers
  let newTasks = TASKS.filter(p => !runningAppList.includes(p));
  log.info(`Placing new tasks: ${newTasks.join(', ')}`);

  while (newTasks.length) {
    const nextTask = newTasks.splice(0, 1);
    
  }
};

module.exports = {
  placeTasks,
};
