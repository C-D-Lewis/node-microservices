const { expect } = require('chai');
const { config, requestAsync } = require('../src/node-common')(['config', 'requestAsync']);

describe('API', () => {
  describe('/status', () => {
    it('should return 200 / \'OK\'', async () => {
      const url = `http://localhost:${config.SERVER.PORT}/status`;
      const data = await requestAsync({ url });

      expect(data.response.statusCode).to.equal(200);
      expect(data.body).to.contain('OK');
    });
  });

  describe('/port', () => {
    it(`should return 200 / { port }`, async () => {
      const url = `http://localhost:${config.SERVER.PORT}/port`;
      const data = await requestAsync({
        url,
        json: { app: 'attic' },  // Next test depends on response from attic
      });

      expect(data.response.statusCode).to.equal(200);
      expect(data.body.port).to.be.a('number');
    });
  });

  describe('/apps', () => {
    it('should return 200 / [{ app, port, status }]', async () => {
      const data = await requestAsync({
        url: `http://localhost:${config.SERVER.PORT}/apps`
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
});
