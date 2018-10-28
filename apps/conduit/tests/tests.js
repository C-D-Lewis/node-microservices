const { expect } = require('chai');

const {
  config, testBed
} = require('@chris-lewis/node-common')(['config', 'testBed']);

describe('API', () => {
  describe('/status', () => {
    it('should return 200 / \'OK\'', async () => {
      const url = `http://localhost:${config.SERVER.PORT}/status`;
      const data = await testBed.requestPromise({ url });

      expect(data.response.statusCode).to.equal(200);
      expect(data.body).to.contain('OK');
    });
  });

  describe('/port', () => {
    it(`should return 200 / { port }`, async () => {
      const url = `http://localhost:${config.SERVER.PORT}/port`;
      const data = await testBed.requestPromise({ 
        url,
        json: { app: 'Attic' }
      });

      expect(data.response.statusCode).to.equal(200);
      expect(data.body.port).to.be.a('number');
    });
  });

  describe('/apps', () => {
    it('should return 200 / [{ app, port, status }]', async () => {
      const data = await testBed.requestPromise({
        url: `http://localhost:${config.SERVER.PORT}/apps`
      });

      const json = JSON.parse(data.body);
      expect(data.response.statusCode).to.equal(200);
      expect(json).to.be.an('array');
      expect(json).to.have.length.gte(1);

      const item = json[0];
      expect(item.app).to.be.a('string');
      expect(item.port).to.be.a('number');
      expect(item.status).to.be.a('string');
    });
  });
});
