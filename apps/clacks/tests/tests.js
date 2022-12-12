// eslint-disable-next-line import/no-extraneous-dependencies
const { expect } = require('chai');
const { WebSocket } = require('ws');
const server = require('../src/modules/server');

/** Fixed clacks port */
const PORT = 7777;

/** Test JSON message */
const TEST_MESSAGE = {
  topic: '/global',
  data: {
    foo: 'bar',
  },
};
/** String version of TEST_MESSAGE */
const TEST_MESSAGE_STR = JSON.stringify(TEST_MESSAGE);

/**
 * Connect to the server.
 *
 * @returns {object} A WebSocket connection.
 */
const connect = () => new WebSocket(`ws://localhost:${PORT}`);

describe('Tests', () => {
  before(server.start);

  after(server.stop);

  describe('WS Server', () => {
    it('should connect to the server, send, and recieve a message', (done) => {
      const ws = connect();
      ws.on('open', () => ws.send(TEST_MESSAGE_STR));
      ws.on('message', (data) => {
        expect(data.toString()).to.equal(TEST_MESSAGE_STR);

        ws.close();
        done();
      });
    });
  });
});
