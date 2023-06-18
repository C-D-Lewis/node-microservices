const { expect } = require('chai');

const {
  config, testing, fetch,
} = require('../src/node-common')(['config', 'testing', 'fetch']);

const { SERVER } = config.get(['SERVER']);

const TEST_WEBHOOK = {
  url: `/testWebhook${Date.now()}`,
  packet: { to: 'attic', topic: 'webhookReceived' },
};

describe('API', () => {
  describe('Conduit topic: status', () => {
    it('should return 200 / OK', async () => {
      const result = await testing.sendConduitPacket({ to: 'concierge', topic: 'status' });

      expect(result.status).to.equal(200);
      expect(result.message.content).to.equal('OK');
    });
  });

  describe('/status', () => {
    it('should return 200 / OK', async () => {
      const res = await fetch(`http://localhost:${SERVER.PORT}/status`);

      expect(res.status).to.equal(200);
      expect(res.body).to.contain('OK');
    });
  });

  describe('Conduit topic: add', () => {
    it('should return 201 / Created', async () => {
      const response = await testing.sendConduitPacket({
        to: 'concierge',
        topic: 'add',
        message: TEST_WEBHOOK,
      });

      expect(response.status).to.equal(201);
      expect(response.message.content).to.equal('Created');
    });
  });

  describe('Hit TEST_WEBHOOK', () => {
    it('should return 200 / OK', async () => {
      const url = `http://localhost:${SERVER.PORT}${TEST_WEBHOOK.url}`;
      const res = await fetch({ url, method: 'POST' });

      expect(res.status).to.equal(200);
      expect(res.body).to.contain('OK');
    });
  });

  describe('Conduit topic: remove', () => {
    it('should return 200 / Removed', async () => {
      const response = await testing.sendConduitPacket({
        to: 'concierge',
        topic: 'remove',
        message: TEST_WEBHOOK,
      });

      expect(response.status).to.equal(200);
      expect(response.message.content).to.equal('Removed');
    });
  });

  describe('Webhook is actually removed', () => {
    it('should return 404 / Not Found', async () => {
      const response = await testing.sendConduitPacket({
        to: 'concierge',
        topic: 'remove',
        message: TEST_WEBHOOK,
      });

      expect(response.status).to.equal(404);
      expect(response.error).to.equal('Not Found');
    });
  });

  describe('Miss TEST_WEBHOOK', () => {
    it('should return 404 / Not Found', async () => {
      const url = `http://localhost:${SERVER.PORT}${TEST_WEBHOOK.url}`;
      const res = await fetch({ url, method: 'POST' });

      expect(res.status).to.equal(404);
      expect(res.body).to.contain('No hook found');
    });
  });
});
