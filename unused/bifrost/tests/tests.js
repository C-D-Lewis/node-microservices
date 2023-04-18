// eslint-disable-next-line import/no-extraneous-dependencies
const { expect } = require('chai');
const { bifrost } = require('../src/node-common')(['bifrost']);
const server = require('../src/modules/server');

describe('Tests', () => {
  before(async () => {
    server.startServer();
    await bifrost.connect({ server: 'localhost' });

    // Example topic that returns the time
    bifrost.registerTopic('getTime', () => ({ time: Date.now() }), {});
  });

  after(() => {
    bifrost.disconnect();
    server.stopServer();
  });

  describe('bifrost server and common library', () => {
    it('should send and recieve a message to self', async () => {
      // send to self
      const { time } = await bifrost.send({ to: 'bifrost', topic: 'getTime' });

      expect(time).to.be.a('number');
    });

    it('should reject when Not Found', (done) => {
      bifrost.send({ to: 'foo', topic: 'bar' })
        .catch((err) => {
          expect(err.message).to.equal('Not Found');
          done();
        });
    });

    it('should expose status topic', async () => {
      const { content } = await bifrost.send({ to: 'bifrost', topic: 'status' });

      expect(content).to.equal('OK');
    });
  });
});
