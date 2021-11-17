const { expect } = require('chai');
const clacks = require('../src/modules/clacks');
const config = require('../src/modules/config');

const {
  CLACKS: { HOSTNAME },
} = config;

/** Test topic */
const TEST_TOPIC = 'testTopic';
/** Test message */
const TEST_MESSAGE = {
  hostname: HOSTNAME,
  topic: TEST_TOPIC,
  data: { foo: 'bar' },
};

describe.only('clacks.js', () => {
  after(clacks.disconnect);

  it('should subscribe to a topic and send itself data', (done) => {
    clacks.connect()
      .then(() => {
        clacks.subscribe(TEST_TOPIC, (data) => {
          expect(data).to.deep.equal(TEST_MESSAGE.data);
          done();
        });
    
        clacks.send(TEST_MESSAGE);
      });
  });

  it('should respond with hostname');
});
