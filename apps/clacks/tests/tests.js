// eslint-disable-next-line import/no-extraneous-dependencies
const { expect } = require('chai');
const { WebSocket } = require('ws');
const { config } = require('../src/node-common')(['config']);
const server = require('../src/modules/server');

const { SERVER: { PORT } } = config;

/**
 * Connect to the server.
 *
 * @returns {object} A WebSocket connection.
 */
const connect = () => new WebSocket(`ws://localhost:${PORT}`);

describe('WS Server', () => {
  before(server.start);

  after(server.stop);

  it('should connect to the server, send, and recieve data', (done) => {
    const ws = connect();
    ws.on('open', () => ws.send('TEST_VALUE'));
    ws.on('message', (data) => {
      expect(data.toString()).to.equal('TEST_VALUE');

      ws.close();
      done();
    });
  });
});
