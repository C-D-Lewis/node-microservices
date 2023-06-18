const { config, log, fetch } = require('../node-common')(['config', 'log', 'fetch']);

config.addPartialSchema({
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

const { SERVER } = config.get(['SERVER']);

/**
 * Send a 'bad request' response.
 *
 * @param {object} res - Express response object.
 */
const sendBadRequest = (res) => {
  const error = 'Bad Request';
  log.error(error);
  res.status(400).send({ error, status: 400 });
};

/**
 * Send a 'not found' response.
 *
 * @param {object} res - Express response object.
 */
const sendNotFound = (res) => {
  const error = 'Not Found';
  log.error(error);
  res.status(404).send({ error, status: 404 });
};

/**
 * Send a 'not authorized' response.
 *
 * @param {object} res - Express response object.
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
 * @param {object} json - Packet to send.
 * @returns {Promise<object>} The request response.
 */
const sendPacket = async (json) => {
  const { data } = await fetch({
    url: `http://localhost:${SERVER.PORT}/conduit`,
    method: 'post',
    body: JSON.stringify(json),
  });

  return data;
};

module.exports = {
  sendBadRequest,
  sendPacket,
  sendNotFound,
  sendNotAuthorized,
};
