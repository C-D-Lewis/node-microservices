const { expect } = require('chai');

const {
  config, testBed
} = require('@chris-lewis/node-common')(['config', 'testBed']);

const AUTH_CODE = 'some_example_code';

describe('API', () => {
  describe('Conduit topic: status', () => {
    it('should return 200 / OK', async () => {
      const result = await testBed.sendConduitPacket({ to: 'SpotifyAuth', topic: 'status' });

      expect(result.status).to.equal(200);
      expect(result.message.content).to.equal('OK');
    });
  });

  describe('/status', () => {
    it('should return 200 / OK', async () => {
      const url = `http://localhost:${config.SERVER.PORT}/status`;
      const data = await testBed.requestPromise({ url });

      expect(data.response.statusCode).to.equal(200);
      expect(data.body).to.contain('OK');
    });
  });

  describe('/callback', () => {
    it('should return 200 / AUTH_CODE', async () => {
      const url = `http://localhost:${config.SERVER.PORT}/callback?code=${AUTH_CODE}&state=0`;
      const data = await testBed.requestPromise({ url });

      expect(data.response.statusCode).to.equal(200);
      expect(data.body).to.contain(AUTH_CODE);
    });
  });

  describe('/color', () => {
    it('should return 200 / Array[3]', async () => {
      const url = `http://localhost:${config.SERVER.PORT}/color`;
      const data = await testBed.requestPromise({ url });

      const json = JSON.parse(data.body);
      expect(data.response.statusCode).to.equal(200);
      expect(json).to.be.an('array');
      expect(json).to.be.length(3);
    });
  });
});