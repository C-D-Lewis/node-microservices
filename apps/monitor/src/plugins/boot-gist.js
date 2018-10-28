const {
  gistSync, ip
} = require('@chris-lewis/node-common')(['gistSync', 'ip']);

let initd = false;

module.exports = () => {
  if(!initd) {
    gistSync.init(() => initd = true);
    return;
  }

  ip.get((currentIp) => {
    const file = gistSync.getFile('ip.json');
    if(file.ip === currentIp) return;

    file.ip = currentIp;
    gistSync.sync();
  });
};
