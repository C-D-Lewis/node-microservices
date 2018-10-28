const request = require('request');

const {
  config, log, requestAsync
} = require('@chris-lewis/node-common')(['config', 'log', 'requestAsync']);

const badRequest = (res) => {
  log.error('Bad Request');
  res.status(400);
  res.send({ error: 'Bad Request', status: 400 });
};

const notFound = (res) => {
  log.error('Not Found');
  res.status(404);
  res.send({ error: 'Not Found', status: 404 });
};

const sendPacket = async (json) => {
  const data = await requestAsync({
    url: `http://localhost:${config.SERVER.PORT}/conduit`,
    method: 'post',
    json
  });

  return data.body;
};

module.exports = { badRequest, sendPacket, notFound };
