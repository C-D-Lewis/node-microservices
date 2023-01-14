// eslint-disable-next-line import/no-extraneous-dependencies
const { expect } = require('chai');
const { bifrost } = require('../src/node-common')(['bifrost']);
const server = require('../src/modules/server');

describe('Tests', () => {
  before(server.startServer);

  after(server.stopServer);

  describe('bifrost server and common library', () => {
    it('should connect to the server, send, and recieve a message', (done) => {
      // connect
      bifrost.connect()
        .then(() => {
          // subscribe
          bifrost.subscribeTopic('foo', (packet) => {
            expect(packet.bar).to.equal('baz');
            bifrost.disconnect();
            done();
          });

          // send to self
          bifrost.send('foo', { bar: 'baz' });
        });
    });
  });
});
