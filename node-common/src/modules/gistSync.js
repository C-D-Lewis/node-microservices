// Sync a local directory with a gist. Useful for backing store purposes. 
// Note: Any remote changes may break sync - push only!

const async = require('async');
const { exec } = require('child_process');
const fs = require('fs');

const config = require('./config');
const log = require('./log');

config.requireKeys('gist-sync.js', {
  required: [ 'GIST_SYNC' ],
  type: 'object', properties: {
    GIST_SYNC: {
      required: [ 'URL', 'DIR', 'SYNC_INTERVAL_M' ],
      type: 'object', properties: {
        URL: { type: 'string' },
        DIR: { type: 'string' },
        SYNC_INTERVAL_M: { type: 'number' }
      }
    }
  }
});

const GIST_DIR = `${config.getInstallPath()}/${config.GIST_SYNC.DIR}`;
const GIT_CONTEXT = { cwd: GIST_DIR };

let jsonFiles;  // { name, content (JSON) }
let initd = false;
let pushEveryHandle;

const loadFiles = () => {
  jsonFiles = fs.readdirSync(GIST_DIR)
    .filter(file => !file.startsWith('.'))
    .map(name => ({ name, content: require(`${GIST_DIR}/${name}`) }));
};

const saveFiles = (doneAll) => {
  jsonFiles.forEach((jsonFile) => {
    fs.writeFileSync(`${GIST_DIR}/${jsonFile.name}`, JSON.stringify(jsonFile.content, null, 2), 'utf8');
  });
  doneAll();
};

const onDoneAll = (err, results, label, doneAll) => {
  if(err && !err.message.includes('git commit')) log.error(err);

  log.info(`Done tasks: ${label}`);
  if(doneAll) doneAll();
};

const init = (doneAll) => {
  if(initd) {
    doneAll();
    return;
  }

  if(config.GIST_SYNC.SYNC_INTERVAL_M) setInterval(sync, 1000 * 60 * config.GIST_SYNC.SYNC_INTERVAL_M);

  async.series([
    done => exec(`rm -rf "${GIST_DIR}"`, done),
    done => exec(`git clone ${config.GIST_SYNC.URL} "${GIST_DIR}"`, done),
    (done) => {
      initd = true;
      loadFiles();
      done();
    }
  ], (err, results) => onDoneAll(err, results, 'init', doneAll));
};

const sync = (doneAll) => {
  async.series([
    init,
    saveFiles,
    done => exec('git config --global credential.helper store', GIT_CONTEXT, done),
    done => exec('git add -A', GIT_CONTEXT, done),
    done => exec('git commit -m "Automated gist update"', GIT_CONTEXT, done),
    done => exec('git push origin master', GIT_CONTEXT, done)
  ], (err, results) => onDoneAll(err, results, 'sync', doneAll));
};

const getFile = (name) => {
  log.assert(initd, 'gist-sync.js initd() must be called first', true);
  return jsonFiles.find(item => item.name === name).content; 
};

module.exports = { init, sync, getFile };
