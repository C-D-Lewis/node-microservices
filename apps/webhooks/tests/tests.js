const { expect } = require('chai');

const {
  config, testBed
} = require('@chris-lewis/node-common')(['config', 'testBed']);

const TEST_WEBHOOK = {
  url: `/testWebhook${Date.now()}`,
  packet: { to: 'Attic', topic: 'webhookReceived' }
};

describe('API', () => {
  describe('Conduit topic: status', () => {
    it('should return 200 / OK', async () => {
      const result = await testBed.sendConduitPacket({ to: 'Webhooks', topic: 'status' });

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

  describe('Conduit topic: add', () => {
    it('should return 200 / OK', async () => {
      const response = await testBed.sendConduitPacket({
        to: 'Webhooks', topic: 'add',
        message: TEST_WEBHOOK
      });

      expect(response.status).to.equal(200);
      expect(response.message.content).to.equal('OK');
    });
  });

  describe('Hit TEST_WEBHOOK', () => {
    it('should return 200 / OK', async () => {
      const url = `http://localhost:${config.SERVER.PORT}${TEST_WEBHOOK.url}`;
      const data = await testBed.requestPromise({ url, method: 'POST' });

      expect(data.response.statusCode).to.equal(200);
      expect(data.body).to.contain('OK');
    });
  });

  describe('Conduit topic: remove', () => {
    it('should return 200 / OK', async () => {
      const response = await testBed.sendConduitPacket({
        to: 'Webhooks', topic: 'remove',
        message: TEST_WEBHOOK
      });

      expect(response.status).to.equal(200);
      expect(response.message.content).to.equal('OK');
    });
  });

  describe('Webhook is actually removed', () => {
    it('should return 404 / Not Found', async () => {
      const response = await testBed.sendConduitPacket({
        to: 'Webhooks', topic: 'remove',
        message: TEST_WEBHOOK
      });

      expect(response.status).to.equal(404);
      expect(response.error).to.equal('Not Found');
    });
  });

  describe('Miss TEST_WEBHOOK', () => {
    it('should return 404 / Not Found', async () => {
      const url = `http://localhost:${config.SERVER.PORT}${TEST_WEBHOOK.url}`;
      const data = await testBed.requestPromise({ url, method: 'POST' });

      expect(data.response.statusCode).to.equal(404);
      expect(data.body).to.contain('Not Found');
    });
  });
});
