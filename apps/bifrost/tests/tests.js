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
    it('should send and recieve a message to self', (done) => {
      // Expect a topic to receive packets
      bifrost.registerTopic('foo', async (message) => {
        expect(message.bar).to.equal('baz');
        done();
      });

      // send to self
      bifrost.send('foo', { bar: 'baz' });
    });

    it('should allow awaiting a packet response', async () => {
      const res = await bifrost.send('getTime');
      expect(res.time).to.be.a('number');
    });
  });
});
