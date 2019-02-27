const { expect } = require('chai');

const { testing } = require('@chris-lewis/node-common')(['testing']);

describe('API', () => {
  describe('Conduit topic: status', () => {
    it('should return 200 / OK', async () => {
      const response = await testing.sendConduitPacket({ to: 'PlugServer', topic: 'status' });

      expect(response.status).to.equal(200);
      expect(response.message.content).to.equal('OK');
    });
  });

  describe('Conduit topic: rediscover', () => {
    it('should return 202 / Rediscovery started', async () => {
      const response = await testing.sendConduitPacket({ to: 'PlugServer', topic: 'rediscover' });

      expect(response.status).to.equal(202);
      expect(response.message.content).to.equal('Rediscovery started');
    });
  });

  describe('Conduit topic: getPlugs', () => {
    it('should return 200 / List of plugs', async () => {
      const response = await testing.sendConduitPacket({ to: 'PlugServer', topic: 'getPlugs' });

      expect(response.status).to.equal(200);
      expect(response.message.plugs).to.be.an('array');
    });
  });

  describe('Conduit topic: setPlugState', () => {
    it('should return 202 / Accepted', async () => {
      let plugs = await testing.sendConduitPacket({ to: 'PlugServer', topic: 'getPlugs' });
      if(!plugs.message.plugs.length) {
        console.log('No plugs available for test!');
        return;
      }

      const testDevice = plugs.message.plugs[0];
      console.log(`Test device: ${JSON.stringify(testDevice)}`);
      const response = await testing.sendConduitPacket({
        to: 'PlugServer', topic: 'setPlugState',
        message: { alias: testDevice.alias, state: !testDevice.state }
      });

      expect(response.status).to.equal(202);
      expect(response.message.content).to.equal('Accepted');
    });
  });
});
