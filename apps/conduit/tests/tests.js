// eslint-disable-next-line import/no-extraneous-dependencies
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

  describe('topic: getApps', () => {
    it('should respond with known apps, including itself', async () => {
      const { data } = await fetch({
        url: `http://localhost:${SERVER.PORT}/conduit`,
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: 'conduit', topic: 'getApps' }),
      });

      expect(data.status).to.equal(200);
      expect(data.message).to.be.an('array');
      expect(data.message.length).to.be.gte(2);

      const found = data.message.find(({ app }) => app === 'conduit');
      expect(found.port).to.be.a('number');
    });
  });

  describe('/ping', () => {
    it('should return 200 / pong', async () => {
      const res = await fetch({
        url: `http://localhost:${SERVER.PORT}/ping`,
      });

      expect(res.status).to.equal(200);
      expect(res.data.pong).to.equal(true);
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

    it('should require auth tokens', async () => {
      const res = await fetch({
        url: `http://localhost:${SERVER.PORT}/conduit`,
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: 'attic',
          device: 'test',
          topic: 'status',
          forceAuthCheck: true,
        }),
      });

      expect(res.data.status).to.equal(401);
      expect(res.data.error).to.equal('Not Authorized: Authorization not provided');
    });

    it('should validate auth tokens', async () => {
      // Set up in Dockerfile
      const token = '32a77a47a43f67acd9b53f6b195842722bf3a2cb';

      const res = await fetch({
        url: `http://localhost:${SERVER.PORT}/conduit`,
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: 'attic',
          topic: 'status',
          auth: token,
          device: 'test',
          forceAuthCheck: true,
        }),
      });

      expect(res.data.status).to.equal(200);
    });

    it('should refuse invalid auth tokens', async () => {
      const res = await fetch({
        url: `http://localhost:${SERVER.PORT}/conduit`,
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: 'attic',
          topic: 'status',
          device: 'test',
          auth: 'invalid',
          forceAuthCheck: true,
        }),
      });

      expect(res.data.status).to.equal(401);
      expect(res.data.error).to.equal('Not Authorized: Authorization check failed: User does not exist');
    });
  });
});
