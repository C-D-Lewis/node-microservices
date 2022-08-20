const { expect } = require('chai');
const { testing } = require('../src/node-common')(['testing']);
const adminPassword = require('../src/modules/adminPassword');

/** Test user name */
const TEST_USER_NAME = 'TestUser';

let inputPassword;
let token;

describe('API', () => {
  before(() => {
    console.log('Waiting for read of adminPassword...');
    adminPassword.waitForFile();
    while (!inputPassword) {
      inputPassword = adminPassword.get();
    }
  });

  describe('Conduit topic: status', () => {
    it('should return 200 / OK', async () => {
      const response = await testing.sendConduitPacket({ to: 'guestlist', topic: 'status' });

      expect(response.message.content).to.equal('OK');
      expect(response.status).to.equal(200);
    });
  });

  describe('Conduit topic: create', () => {
    it('should return 201 / User', async () => {
      const payload = {
        name: TEST_USER_NAME,
        apps: ['attic'],
        topics: ['get'],
        adminPassword: inputPassword,
      };
      const response = await testing.sendConduitPacket({
        to: 'guestlist',
        topic: 'create',
        message: payload,
      });

      const { status, message } = response;
      expect(message.name).to.equal(payload.name);
      expect(message.password).to.equal(undefined);
      expect(message.apps).to.deep.equal(payload.apps);
      expect(message.topics).to.deep.equal(payload.topics);
      expect(message.token).to.be.a('string');
      expect(status).to.equal(201);

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
      expect(message.name).to.equal(payload.name);
      expect(message.token).to.equal(undefined);
      expect(message.apps).to.be.an('array');
      expect(message.topics).to.be.an('array');
      expect(status).to.equal(200);
    });
  });

  describe('Conduit topic: authorize', () => {
    it('should return 200 / OK', async () => {
      const response = await testing.sendConduitPacket({
        to: 'guestlist',
        topic: 'authorize',
        message: {
          to: 'attic',
          topic: 'get',
          token,
        },
      });

      const { status, message } = response;
      expect(message.content).to.equal('OK');
      expect(status).to.equal(200);
    });

    it('should return 404 / Not found', async () => {
      const response = await testing.sendConduitPacket({
        to: 'guestlist',
        topic: 'authorize',
        message: {
          to: 'attic',
          topic: 'get',
          token: 'badtokenbadbadtoken',
        },
      });

      const { status, error } = response;
      expect(error).to.equal('User does not exist');
      expect(status).to.equal(404);
    });

    it('should return 401 / Not Authorized for invalid app', async () => {
      const response = await testing.sendConduitPacket({
        to: 'guestlist',
        topic: 'authorize',
        message: {
          to: 'ambience',
          topic: 'off',
          token,
        },
      });

      const { status, error } = response;
      expect(error).to.equal('User is not permitted for app ambience');
      expect(status).to.equal(401);
    });

    it('should return 401 / Not Authorized for invalid topic', async () => {
      const response = await testing.sendConduitPacket({
        to: 'guestlist',
        topic: 'authorize',
        message: {
          to: 'attic',
          topic: 'set',
          token,
        },
      });

      const { status, error } = response;
      expect(error).to.equal('User is not permitted for topic set');
      expect(status).to.equal(401);
    });
  });

  describe('Conduit topic: delete', () => {
    it('should return 200 / OK', async () => {
      const payload = { name: TEST_USER_NAME, adminPassword };
      const response = await testing.sendConduitPacket({
        to: 'guestlist',
        topic: 'delete',
        message: payload,
      });

      const { status, message } = response;
      expect(message.content).to.equal('Deleted');
      expect(status).to.equal(200);
    });
  });
});
