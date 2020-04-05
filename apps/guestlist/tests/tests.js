const { expect } = require('chai');
const { testing } = require('../src/node-common')(['testing']);
const adminPassword = require('../src/modules/adminPassword');

/** Test user name */
const TEST_USER_NAME = 'TestUser';

let auth;
let token;

describe('API', () => {
  before(() => {
    console.log('Waiting for read of adminPassword...');
    adminPassword.waitForFile();
    while (!auth) {
      auth = adminPassword.get();
    }
  });

  describe('Conduit topic: status', () => {
    it('should return 200 / OK', async () => {
      const response = await testing.sendConduitPacket({ to: 'guestlist', topic: 'status' });

      expect(response.status).to.equal(200);
      expect(response.message.content).to.equal('OK');
    });
  });

  describe('Conduit topic: create', () => {
    it('should return 201 / User', async () => {
      const payload = {
        name: TEST_USER_NAME,
        apps: ['attic'],
        topics: ['get'],
      };
      const response = await testing.sendConduitPacket({
        to: 'guestlist',
        topic: 'create',
        message: payload,
        auth,
      });

      const { status, message } = response;
      expect(status).to.equal(201);
      expect(message.name).to.equal(payload.name);
      expect(message.password).to.equal(undefined);
      expect(message.apps).to.deep.equal(payload.apps);
      expect(message.topics).to.deep.equal(payload.topics);
      expect(message.token).to.be.a('string');

      token = message.token;
    });
  });

  describe('Conduit topic: get', () => {
    it('should return 200 / User', async () => {
      const payload = { name: TEST_USER_NAME };
      const response = await testing.sendConduitPacket({
        to: 'guestlist',
        topic: 'get',
        message: payload,
      });

      const { status, message } = response;
      expect(status).to.equal(200);
      expect(message.name).to.equal(payload.name);
      expect(message.token).to.equal(undefined);
      expect(message.apps).to.be.an('array');
      expect(message.topics).to.be.an('array');
    });
  });

  describe('Conduit topic: authorize', () => {
    it('should return 200 / OK', async () => {
      const response = await testing.sendConduitPacket({
        to: 'guestlist',
        topic: 'authorize',
        message: { token },
      });

      const { status, message } = response;
      expect(status).to.equal(200);
      expect(message.content).to.equal('OK');
    });

    it('should return 404 / Not found', async () => {
      const response = await testing.sendConduitPacket({
        to: 'guestlist',
        topic: 'authorize',
        message: { token: 'badtokenbadbadtoken' },
      });

      const { status, error } = response;
      expect(status).to.equal(404);
      expect(error).to.equal('User does not exist');
    });
  });

  describe('Conduit topic: delete', () => {
    it('should return 200 / OK', async () => {
      const payload = { name: TEST_USER_NAME };
      const response = await testing.sendConduitPacket({
        to: 'guestlist',
        topic: 'delete',
        message: payload,
        auth,
      });

      const { status, message } = response;
      expect(status).to.equal(200);
      expect(message.content).to.equal('Deleted');
    });
  });
});
