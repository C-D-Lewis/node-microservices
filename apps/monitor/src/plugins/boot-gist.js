const { gistSync, ip } = require('../node-common')(['gistSync', 'ip']);

let initd = false;

/**
 * Update the IP of the mothership in a secret Gist.
 */
module.exports = () => {
  if (!initd) {
    gistSync.init(() => {
      initd = true;
    });
    return;
  }

  ip.get((currentIp) => {
    const file = gistSync.getFile('ip.json');
    if (file.ip === currentIp) return;

    file.ip = currentIp;
    gistSync.sync();
  });
};
