// eslint-disable-next-line import/no-extraneous-dependencies
const { expect } = require('chai');
const { bifrost } = require('../src/node-common')(['bifrost']);
const adminPassword = require('../src/modules/adminPassword');

/** Test user name */
const TEST_USER_NAME = 'TestUser';

let inputPassword;
let token;

describe('API', () => {
  before(async () => {
    console.log('Waiting for read of adminPassword...');
    adminPassword.watchForFile();
    while (!inputPassword) {
      inputPassword = adminPassword.get();
    }

    await bifrost.connect({ appName: 'guestlistTests' });

    // Delete test user if they exist
    try {
      await bifrost.send({
        to: 'guestlist',
        topic: 'delete',
        message: {
          name: TEST_USER_NAME,
          adminPassword: inputPassword,
        },
      });
    } catch (e) { /* not existing */ }
  });

  after(bifrost.disconnect);

  describe('Bifrost topic: status', () => {
    it('should return OK', async () => {
      const { content } = await bifrost.send({ to: 'guestlist', topic: 'status' });

      expect(content).to.equal('OK');
    });
  });

  describe('Bifrost topic: create', () => {
    it('should return User', async () => {
      const payload = {
        name: TEST_USER_NAME,
        apps: ['attic'],
        topics: ['get'],
        adminPassword: inputPassword,
      };
      const message = await bifrost.send({
        to: 'guestlist',
        topic: 'create',
        message: payload,
      });

      expect(message.name).to.equal(payload.name);
      expect(message.password).to.equal(undefined);
      expect(message.apps).to.deep.equal(payload.apps);
      expect(message.topics).to.deep.equal(payload.topics);
      expect(message.token).to.be.a('string');

      token = message.token;
    });
  });

  describe('Bifrost topic: get', () => {
    it('should return User', async () => {
      const payload = { name: TEST_USER_NAME };
      const message = await bifrost.send({
        to: 'guestlist',
        topic: 'get',
        message: payload,
      });

      expect(message.name).to.equal(payload.name);
      expect(message.token).to.equal(undefined);
      expect(message.apps).to.be.an('array');
      expect(message.topics).to.be.an('array');
    });
  });

  describe('Bifrost topic: authorize', () => {
    it('should return OK', async () => {
      const { content } = await bifrost.send({
        to: 'guestlist',
        topic: 'authorize',
        message: {
          to: 'attic',
          topic: 'get',
          token,
        },
      });

      expect(content).to.equal('OK');
    });

    it('should return Not found', async () => {
      try {
        await bifrost.send({
          to: 'guestlist',
          topic: 'authorize',
          message: {
            to: 'attic',
            topic: 'get',
            token: 'badtokenbadbadtoken',
          },
        });
      } catch (e) {
        expect(e.message).to.equal('User does not exist');
      }
    });

    it('should return Not Authorized for invalid app', async () => {
      try {
        await bifrost.send({
          to: 'guestlist',
          topic: 'authorize',
          message: {
            to: 'fakeapp',
            topic: 'off',
            token,
          },
        });
      } catch (e) {
        expect(e.message).to.equal('User is not permitted for app fakeapp');
      }
    });

    it('should return Not Authorized for invalid topic', async () => {
      try {
        await bifrost.send({
          to: 'guestlist',
          topic: 'authorize',
          message: {
            to: 'attic',
            topic: 'set',
            token,
          },
        });
      } catch (e) {
        expect(e.message).to.equal('User is not permitted for topic set');
      }
    });
  });

  describe('Bifrost topic: delete', () => {
    it('should return OK', async () => {
      const payload = { name: TEST_USER_NAME, adminPassword: inputPassword };
      const { content } = await bifrost.send({
        to: 'guestlist',
        topic: 'delete',
        message: payload,
      });

      expect(content).to.equal('Deleted');
    });
  });
});
