const { config, log, requestAsync } = require('../node-common')(['config', 'log', 'requestAsync']);

config.requireKeys('conduit.js', {
  required: ['SERVER'],
  properties: {
    SERVER: {
      required: ['PORT'],
      properties: {
        PORT: { type: 'integer' },
      },
    },
  },
});

/**
 * Send a 'bad request' response.
 *
 * @param {Object} res - Express response object.
 */
const sendBadRequest = (res) => {
  const error = 'Bad Request';
  log.error(error);
  res.status(400).send({ error, status: 400 });
};

/**
 * Send a 'not found' response.
 *
 * @param {Object} res - Express response object.
 */
const sendNotFound = (res) => {
  const error = 'Not Found';
  log.error(error);
  res.status(404).send({ error, status: 404 });
};

/**
 * Send a 'not authorized' response.
 *
 * @param {Object} res - Express response object.
 * @param {string} reason - Reason not authorized.
 */
const sendNotAuthorized = (res, reason = 'None') => {
  const error = `Not Authorized: ${reason}`;
  log.error(error);
  res.status(401).send({ error, status: 401 });
};

/**
 * Send a packet.
 *
 * @param {Object} json - Packet to send.
 * @returns {Promise<Object>} The request response.
 */
const sendPacket = async (json) => {
  const { body } = await requestAsync({
    url: `http://localhost:${config.SERVER.PORT}/conduit`,
    method: 'post',
    json,
  });

  return body;
};

module.exports = {
  sendBadRequest,
  sendPacket,
  sendNotFound,
  sendNotAuthorized,
};
