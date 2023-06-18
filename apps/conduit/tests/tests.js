const { expect } = require('chai');
const { config, requestAsync } = require('../src/node-common')(['config', 'requestAsync']);

const { SERVER } = config.get(['SERVER']);

describe('API', () => {
  describe('/status', () => {
    it('should return 200 / \'OK\'', async () => {
      const url = `http://localhost:${SERVER.PORT}/status`;
      const data = await requestAsync({ url });

      expect(data.response.statusCode).to.equal(200);
      expect(data.body).to.contain('OK');
    });
  });

  describe('/port', () => {
    it('should return 200 / { port }', async () => {
      const url = `http://localhost:${SERVER.PORT}/port`;
      const data = await requestAsync({
        url,
        json: { app: 'testApp', pid: 0 },  // Next test depends on response from attic
      });

      expect(data.response.statusCode).to.equal(200);
      console.log({ data })
      expect(data.body.port).to.be.a('number');
    });
  });

  describe('/apps', () => {
    it('should return 200 / [{ app, port, status }]', async () => {
      const data = await requestAsync({
        url: `http://localhost:${SERVER.PORT}/apps`,
      });

      const json = JSON.parse(data.body);
      expect(data.response.statusCode).to.equal(200);
      expect(json).to.be.an('array');
      expect(json).to.have.length.gte(1);

      const [item] = json;
      expect(item.app).to.be.a('string');
      expect(item.port).to.be.a('number');
      expect(item.status).to.be.a('string');
    });
  });

  describe('/conduit', () => {
    it('should handle a valid packet', async () => {
      const data = await requestAsync({
        url: `http://localhost:${SERVER.PORT}/conduit`,
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: 'test', topic: 'test' }),
      });

      const json = JSON.parse(data.body);
      expect(json.ok).to.equal(true);
    });

    it('should refuse an invalid packet', async () => {
      const data = await requestAsync({
        url: `http://localhost:${SERVER.PORT}/conduit`,
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: 'test' }),
      });

      const json = JSON.parse(data.body);
      expect(json.status).to.equal(400);
      expect(json.error).to.equal('Bad Request');
    });

    it('should use guestlist to check tokens', async () => {
      // Set up in Dcokerfile
      const token = '32a77a47a43f67acd9b53f6b195842722bf3a2cb';

      const data = await requestAsync({
        url: `http://localhost:${SERVER.PORT}/conduit`,
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: 'attic', topic: 'status', auth: token, ignoreHostname: true,
        }),
      });

      const json = JSON.parse(data.body);
      expect(json.status).to.equal(200);
    });

    it('should use guestlist to refuse tokens', async () => {
      const data = await requestAsync({
        url: `http://localhost:${SERVER.PORT}/conduit`,
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: 'attic', topic: 'status', auth: 'invalid', ignoreHostname: true,
        }),
      });

      const json = JSON.parse(data.body);
      expect(json.status).to.equal(401);
      expect(json.error).to.equal('Not Authorized: Authorization check failed: User does not exist');
    });

    it('should use guestlist to require tokens', async () => {
      const data = await requestAsync({
        url: `http://localhost:${SERVER.PORT}/conduit`,
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: 'attic', topic: 'status', ignoreHostname: true,
        }),
      });

      const json = JSON.parse(data.body);
      expect(json.status).to.equal(401);
      expect(json.error).to.equal('Not Authorized: Authorization not provided');
    });
  });
});
