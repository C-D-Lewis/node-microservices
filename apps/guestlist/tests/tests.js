const { expect } = require('chai');
const { testing } = require('../src/node-common')(['testing']);

const TEST_USER_NAME = 'TestUser';

describe('API', () => {
  after(async () => {
    // TODO: Delete test user
  });

  describe('Conduit topic: status', () => {
    it('should return 200 / OK', async () => {
      const response = await testing.sendConduitPacket({ to: 'guestlist', topic: 'status' });

      expect(response.status).to.equal(200);
      expect(response.message.content).to.equal('OK');
    });
  });

  describe('Conduit topic: create', () => {
    it('should return 201 / UserDocument', async () => {
      const payload = {
        name: TEST_USER_NAME,
        password: 'testpassword',
        apps: ['attic'],
        topics: ['get'],
      };
      const response = await testing.sendConduitPacket({
        to: 'guestlist',
        topic: 'create',
        message: payload,
      });

      const { status, message } = response;
      expect(status).to.equal(201);
      expect(message.name).to.equal(payload.name);
      expect(message.password).to.equal(undefined);
      expect(message.apps).to.deep.equal(payload.apps);
      expect(message.topics).to.deep.equal(payload.topics);
    });
  });

  describe('Conduit topic: get', () => {
    it('should return 200 / UserDocument', async () => {
      const payload = { name: TEST_USER_NAME };
      const response = await testing.sendConduitPacket({
        to: 'guestlist',
        topic: 'get',
        message: payload,
      });

      const { status, message } = response;
      expect(status).to.equal(200);
      expect(message.name).to.equal(payload.name);
      expect(message.password).to.equal(undefined);
      expect(message.apps).to.be.an('array');
      expect(message.topics).to.be.an('array');
    });
  });
});
