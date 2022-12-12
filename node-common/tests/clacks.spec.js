const { expect } = require('chai');
const { hostname } = require('os');
const clacks = require('../src/modules/clacks');

/** Test topic */
const TEST_TOPIC = `/devices/${hostname()}/testTopic`;

describe('clacks.js', () => {
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

  it('should respond with own hostname', (done) => {
    // Wait for responses
    clacks.subscribeHostnames((name) => {
      // Only one expected
      expect(name).to.be.a('string');
      done();
    });

    // Request
    clacks.requestHostnames();
  });
});
