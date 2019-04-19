const { config, log, requestAsync } = require('../node-common')(['config', 'log', 'requestAsync']);

const badRequest = (res) => {
  log.error('Bad Request');
  res.status(400).send({ error: 'Bad Request', status: 400 });
};

const notFound = (res) => {
  log.error('Not Found');
  res.status(404).send({ error: 'Not Found', status: 404 });
};

const sendPacket = async (json) => {
  const { body } = await requestAsync({
    url: `http://localhost:${config.SERVER.PORT}/conduit`,
    method: 'post',
    json,
  });

  return body;
};

module.exports = {
  badRequest,
  sendPacket,
  notFound,
};
