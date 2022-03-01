// Sync a local directory with a gist. Useful for backing store purposes.
// Note: Any remote changes may break sync - push from here only!

const { execSync } = require('child_process');
const fs = require('fs');
const config = require('./config');
const log = require('./log');

config.requireKeys('gist-sync.js', {
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

const GIST_DIR = `${config.getInstallPath()}/${config.GIST_SYNC.DIR}`;
const GIT_CONTEXT = { cwd: GIST_DIR };

let jsonFiles;  // { name, content (JSON) }

// Assumes all files are JSON data files
const loadFiles = () => jsonFiles = fs.readdirSync(GIST_DIR)
  .filter(p => !p.startsWith('.'))
  .map(name => ({ name, content: require(`${GIST_DIR}/${name}`) }));

const saveFiles = () => jsonFiles.forEach((jsonFile) => {
  const str = JSON.stringify(jsonFile.content, null, 2);
  fs.writeFileSync(`${GIST_DIR}/${jsonFile.name}`, str, 'utf8');
});

const init = () => {
  if (jsonFiles) {
    return;
  }

  if (config.GIST_SYNC.SYNC_INTERVAL_M) {
    log.info(`Setting gistSync to sync every ${config.GIST_SYNC.SYNC_INTERVAL_M} minutes.`);
    setInterval(sync, 1000 * 60 * config.GIST_SYNC.SYNC_INTERVAL_M);
  }

  execSync(`rm -rf "${GIST_DIR}"`);
  execSync(`git clone ${config.GIST_SYNC.URL} "${GIST_DIR}"`);
  loadFiles();
  log.debug('gistSync: init completed');
};

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

const getFile = (name) => {
  log.assert(jsonFiles !== null, 'gist-sync.js init() must be called first', true);
  return jsonFiles.find(p => p.name === name).content;
};

module.exports = {
  init,
  sync,
  getFile,
};
