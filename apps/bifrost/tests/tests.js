// eslint-disable-next-line import/no-extraneous-dependencies
const { expect } = require('chai');
const { bifrost } = require('../src/node-common')(['bifrost']);
const server = require('../src/modules/server');

describe('Tests', () => {
  before(async () => {
    server.startServer();
    await bifrost.connect();

    // Example topic that returns the time
    bifrost.registerTopic('getTime', () => ({ time: Date.now() }));
  });

  after(() => {
    bifrost.disconnect();
    server.stopServer();
  });

  describe('bifrost server and common library', () => {
    it('should send and recieve a message to self', async () => {
      // send to self
      const { time } = await bifrost.send('bifrost', 'getTime');

      expect(time).to.be.a('number');
    });

    it('should reject when Not Found', (done) => {
      bifrost.send('foo', 'bar')
        .catch((err) => {
          expect(err.message).to.equal('Not Found');
          done();
        });
    });
  });
});
