const { log } = require('@chris-lewis/node-common')(['log']);

const anims = require('../modules/anims');

module.exports = (packet, res) => {
  log.debug('<< /spotify');

  anims.spotify(packet, res);
};
