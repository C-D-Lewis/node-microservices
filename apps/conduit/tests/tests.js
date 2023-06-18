const { expect } = require('chai');
const { config, fetch } = require('../src/node-common')(['config', 'fetch']);

const { SERVER } = config.get(['SERVER']);

describe('API', () => {
  describe('/status', () => {
    it('should return 200 / \'OK\'', async () => {
      const res = await fetch(`http://localhost:${SERVER.PORT}/status`);

      expect(res.status).to.equal(200);
      expect(res.body).to.contain('OK');
    });
  });

  describe('/port', () => {
    it('should return 200 / { port }', async () => {
      const url = `http://localhost:${SERVER.PORT}/port`;
      const res = await fetch({
        url,
        method: 'POST',
        body: JSON.stringify({ app: 'testApp', pid: 0 }),  // Next test depends on response from attic
      });

      expect(res.status).to.equal(200);
      expect(res.data.port).to.be.a('number');
    });
  });

  describe('/apps', () => {
    it('should return 200 / [{ app, port, status }]', async () => {
      const res = await fetch({
        url: `http://localhost:${SERVER.PORT}/apps`,
      });

      expect(res.status).to.equal(200);
      expect(res.data).to.be.an('array');
      expect(res.data).to.have.length.gte(1);

      const [item] = res.data;
      expect(item.app).to.be.a('string');
      expect(item.port).to.be.a('number');
      expect(item.status).to.be.a('string');
    });
  });

  describe('/conduit', () => {
    it('should handle a valid packet', async () => {
      const res = await fetch({
        url: `http://localhost:${SERVER.PORT}/conduit`,
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: 'test', topic: 'test' }),
      });

      expect(res.data.ok).to.equal(true);
    });

    it('should refuse an invalid packet', async () => {
      const res = await fetch({
        url: `http://localhost:${SERVER.PORT}/conduit`,
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: 'test' }),
      });

      expect(res.status).to.equal(400);
      expect(res.data.error).to.equal('Bad Request');
    });

    it('should use guestlist to check tokens', async () => {
      // Set up in Dockerfile
      const token = '32a77a47a43f67acd9b53f6b195842722bf3a2cb';

      const res = await fetch({
        url: `http://localhost:${SERVER.PORT}/conduit`,
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: 'attic', topic: 'status', auth: token, ignoreHostname: true,
        }),
      });

      expect(res.data.status).to.equal(200);
    });

    it('should use guestlist to refuse tokens', async () => {
      const res = await fetch({
        url: `http://localhost:${SERVER.PORT}/conduit`,
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: 'attic', topic: 'status', auth: 'invalid', ignoreHostname: true,
        }),
      });

      expect(res.data.status).to.equal(401);
      expect(res.data.error).to.equal('Not Authorized: Authorization check failed: User does not exist');
    });

    it('should use guestlist to require tokens', async () => {
      const res = await fetch({
        url: `http://localhost:${SERVER.PORT}/conduit`,
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: 'attic', topic: 'status', ignoreHostname: true,
        }),
      });

      expect(res.data.status).to.equal(401);
      expect(res.data.error).to.equal('Not Authorized: Authorization not provided');
    });
  });
});
