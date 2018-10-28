const { expect } = require('chai');

const { testBed } = require('@chris-lewis/node-common')(['testBed']);

describe('API', () => {
  describe('Conduit topic: status', () => {
    it('should return 200 / OK', async () => {
      const result = await testBed.sendConduitPacket({ to: 'Monitor', topic: 'status' });

      expect(result.status).to.equal(200);
      expect(result.message.content).to.equal('OK');
    });
  });
});
