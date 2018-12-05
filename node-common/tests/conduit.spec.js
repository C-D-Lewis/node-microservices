const { expect } = require('chai');
const conduit = require('../src/modules/conduit');

describe('conduit.js', () => {
  it('should connect to Conduit service', async () => {
    await conduit.register();
  });

  it('should register a topic with schema', async () => {
    const schema = {
      required: ['foo'],
      properties: {
        foo: { type: 'number' },
      },
    };

    conduit.on('foo', (res, packet) => {}, schema);
  });

  it('should send a status packet and get 200', async () => {
    const packet = { to: 'NodeCommon', topic: 'status' };
    const res = await conduit.send(packet);

    expect(res.status).to.equal(200);
  });

  it('should respond to an incoming packet', (done) => {
    setTimeout(async () => {
      const packet = { to: 'NodeCommon', topic: 'bar' };
      const res = await conduit.send(packet);

      expect(res.message.content).to.equal('OK');
      done();
    }, 100);

    conduit.on('bar', (packet, res) => {
      conduit.respond(res, {
        status: 200,
        message: { content: 'OK' },
      });
    }, {});
  });

  it('should be registered', () => {
    expect(conduit.isRegistered() !== undefined).to.equal(true);
  });
});
