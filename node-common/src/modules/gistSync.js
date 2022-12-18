// Sync a local directory with a gist. Useful for backing store purposes.
// Note: Any remote changes may break sync - push from here only!

const { execSync } = require('child_process');
const fs = require('fs');
const config = require('./config');
const log = require('./log');

const { GIST_SYNC } = config.withSchema('gist-sync.js', {
  required: ['GIST_SYNC'],
  properties: {
    GIST_SYNC: {
      required: ['URL', 'DIR'],
      properties: {
        URL: { type: 'string' },
        DIR: { type: 'string' },
        SYNC_INTERVAL_M: { type: 'number' },
      },
    },
  },
});

const {
  SYNC_INTERVAL_M,
  URL,
  DIR,
} = GIST_SYNC;

/** Directory to clone gist */
const GIST_DIR = `${config.getInstallPath()}/${DIR}`;
/** Context for git commands */
const GIT_CONTEXT = { cwd: GIST_DIR };

let jsonFiles;  // { name, content (JSON) }

/**
 * Load files from the Gist as JSON files.
 */
const loadFiles = () => {
  jsonFiles = fs.readdirSync(GIST_DIR)
    .filter((p) => !p.startsWith('.'))
    .map((name) => ({ name, content: require(`${GIST_DIR}/${name}`) }));
};

/**
 * Save loaded files to disk.
 *
 * @returns {void}
 */
const saveFiles = () => jsonFiles.forEach((jsonFile) => {
  const str = JSON.stringify(jsonFile.content, null, 2);
  fs.writeFileSync(`${GIST_DIR}/${jsonFile.name}`, str, 'utf8');
});

/**
 * Init the Gist and optionally set up scheduled sync.
 */
const init = () => {
  if (jsonFiles) return;

  // Optionally sync
  if (SYNC_INTERVAL_M) {
    log.info(`Setting gistSync to sync every ${SYNC_INTERVAL_M} minutes.`);
    // eslint-disable-next-line no-use-before-define
    setInterval(sync, 1000 * 60 * SYNC_INTERVAL_M);
  }

  // Prevent erasing the whole project
  if (!DIR) throw new Error('DIR not set');

  execSync(`rm -rf "${GIST_DIR}"`);
  execSync(`git clone ${URL} "${GIST_DIR}"`);
  loadFiles();
  log.debug('gistSync: init completed');
};

/**
 * Sync files.
 */
const sync = () => {
  init();
  saveFiles();

  execSync('git config --global credential.helper store', GIT_CONTEXT);
  execSync('git add -A', GIT_CONTEXT);
  try {
    execSync('git commit -m "Automated gist update"', GIT_CONTEXT);
  } catch (e) {
    // git commit throws for some reason
    if (!e.message.includes('git commit')) {
      throw e;
    }
  }
  execSync('git push origin master', GIT_CONTEXT);
  log.debug('gistSync: sync completed');
};

/**
 * Get a file by name.
 *
 * @param {string} name - File to get.
 * @returns {object|undefined} Found file.
 */
const getFile = (name) => {
  log.assert(jsonFiles !== null, 'gist-sync.js init() must be called first', true);
  return jsonFiles.find((p) => p.name === name).content;
};

module.exports = {
  init,
  sync,
  getFile,
};
