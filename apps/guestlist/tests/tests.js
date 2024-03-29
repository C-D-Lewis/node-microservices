const { expect } = require('chai');
const { testing } = require('../src/node-common')(['testing']);
const adminPassword = require('../src/modules/adminPassword');
const { ATTIC_KEY_USERS } = require('../src/constants');
const { migrateTokenUsers } = require('../src/modules/util');
const { attic } = require('../src/node-common')(['attic']);

/** Test user name */
const TEST_USER_NAME = 'TestUser';

let inputPassword;
let token;

describe('API', () => {
  before(async () => {
    console.log('Waiting for read of adminPassword...');
    adminPassword.waitForFile();
    while (!inputPassword) {
      inputPassword = adminPassword.get();
    }

    // Delete test user if they exist
    await testing.sendConduitPacket({
      to: 'guestlist',
      topic: 'delete',
      message: {
        name: TEST_USER_NAME,
        adminPassword: inputPassword,
      },
    });
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
        devices: ['stack-ext'],
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
      expect(message.devices).to.deep.equal(payload.devices);
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
    it('should return 200 / user record', async () => {
      const response = await testing.sendConduitPacket({
        to: 'guestlist',
        topic: 'authorize',
        message: {
          to: 'attic',
          topic: 'get',
          device: 'stack-ext',
          auth: token,
        },
      });

      const { status, message } = response;
      expect(message.authorized).to.equal(true);
      expect(message.userRecord).to.be.an('object');
      expect(status).to.equal(200);
    });

    it('should return 404 / Not found', async () => {
      const response = await testing.sendConduitPacket({
        to: 'guestlist',
        topic: 'authorize',
        message: {
          to: 'attic',
          topic: 'get',
          auth: 'badtokenbadbadtoken',
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
          auth: token,
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
          auth: token,
        },
      });

      const { status, error } = response;
      expect(error).to.equal('User is not permitted for topic set');
      expect(status).to.equal(401);
    });

    it('should return 401 / Not Authorized for invalid device', async () => {
      const response = await testing.sendConduitPacket({
        to: 'guestlist',
        topic: 'authorize',
        message: {
          to: 'attic',
          topic: 'get',
          device: 'invalid',
          auth: token,
        },
      });

      const { status, error } = response;
      expect(error).to.equal('User is not permitted for device invalid');
      expect(status).to.equal(401);
    });

    it('should allow legacy user with devices unset', async () => {
      // Set in Dockerfile
      const noDevicesToken = '32a77a47a43f67acd9b53f6b195842722bf3a299';

      const response = await testing.sendConduitPacket({
        to: 'guestlist',
        topic: 'authorize',
        message: {
          to: 'attic',
          topic: 'get',
          auth: noDevicesToken,
        },
      });

      const { status, message } = response;
      expect(message.authorized).to.equal(true);
      expect(status).to.equal(200);
    });
  });

  describe('Conduit topic: delete', () => {
    it('should return 200 / OK', async () => {
      const payload = { name: TEST_USER_NAME, adminPassword: inputPassword };
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

describe('utils', () => {
  it('should migrate old users', async () => {
    attic.setAppName('test');

    // Plant old user with token
    let list = (await attic.exists(ATTIC_KEY_USERS))
      ? (await attic.get(ATTIC_KEY_USERS))
      : [];
    list.push({
      id: '0e0d8c03acce3146ca8b7325caa9292b',
      name: 'userwithtoken',
      apps: ['attic'],
      topics: ['get'],
      devices: ['all'],
      createdAt: 1708172364292,
      token: '32a77a47a43f67acd9b53f6b195842722bf3a299',
    });
    await attic.set(ATTIC_KEY_USERS, list);

    // Run update function
    await migrateTokenUsers();

    // Check result
    list = await attic.get(ATTIC_KEY_USERS);
    const hash = 'f82559394470730bbbe04225ba10a2ad9d08bde3f08c315e3279b8d2ceda63ff';
    const found = list.find((p) => p.hash === hash);

    // Cleanup
    list = list.filter(p => p.name !== 'userwithtoken');
    await attic.set(ATTIC_KEY_USERS, list);

    expect(found.hash).to.equal(hash);

  });
});
