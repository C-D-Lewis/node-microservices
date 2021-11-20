const { expect } = require('chai');
const clacks = require('../src/modules/clacks');
const config = require('../src/modules/config');

const {
  CLACKS: { HOSTNAME },
} = config;

/** Test topic */
const TEST_TOPIC = `/devices/${HOSTNAME}/testTopic`;

describe.only('clacks.js', () => {
  after(clacks.disconnect);

  it('should subscribe to a topic and send itself data', (done) => {
    const testData = { foo: 'bar' };

    clacks.connect()
      .then(() => {
        clacks.subscribeTopic(TEST_TOPIC, (data) => {
          expect(data).to.deep.equal(testData);
          done();
        });
    
        clacks.send(TEST_TOPIC, testData);
      });
  });

  it('should respond with hostname', (done) => {
    // Wait for responses
    clacks.subscribeHostnames((name) => {
      // Only one expected
      expect(name).to.equal(HOSTNAME);
      done();
    });

    // Request
    clacks.requestHostnames();
  });
});
