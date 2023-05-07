const express = require('express');
const config = require('./config');
const log = require('./log');

config.addPartialSchema({
  required: ['SERVER'],
  properties: {
    SERVER: {
      required: ['PORT'],
      properties: {
        PORT: { type: 'number' },
      },
    },
  },
});

const { SERVER } = config.get(['SERVER']);

let app;
let server;

/**
 * Respond to a request.
 *
 * @param {object} res - Express response object.
 * @param {number} code - Status code.
 * @param {string} body - Body to send.
 * @returns {void}
 */
const respond = (res, code, body) => res.status(code).send(body);

/**
 * Respond with the pid.
 *
 * @param {object} res - Express response object.
 * @returns {void}
 */
const respondWithPid = (res) => res.status(200).json({ pid: process.pid });

/**
 * Start the server.
 *
 * @returns {Promise<void>}
 */
const start = () => new Promise((resolve) => {
  app = express();

  // Default routes for all apps
  app.get('/status', (req, res) => module.exports.respondOk(res));
  app.get('/pid', (req, res) => respondWithPid(res));

  // CORS for browsers
  app.use((req, res, next) => {
    res.set('Access-Control-Allow-Origin', '*');
    next();
  });

  server = app.listen(SERVER.PORT, () => {
    log.info(`Express server up on ${SERVER.PORT}`);
    resolve();
  });
});

module.exports = {
  start,
  /**
   * Stop the server.
   *
   * @returns {void}
   */
  stop: () => server.close(),
  /**
   * Get the Express app.
   *
   * @returns {object} The Express app.
   */
  getExpressApp: () => app,
  /**
   * Respond with OK.
   *
   * @param {object} res - Express response object.
   * @returns {void}
   */
  respondOk: (res) => respond(res, 200, 'OK\n'),
  /**
   * Respond with Bad Request.
   *
   * @param {object} res - Express response object.
   * @returns {void}
   */
  respondBadRequest: (res) => respond(res, 400, 'Bad Request\n'),
  /**
   * Respond with Not Found.
   *
   * @param {object} res - Express response object.
   * @returns {void}
   */
  respondNotFound: (res) => respond(res, 404, 'Not Found\n'),
};
