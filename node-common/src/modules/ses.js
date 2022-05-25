const config = require('./config');
const log = require('./log');

config.requireKeys('ses.js', {
  required: ['SES'],
  properties: {
    SES: {
      required: ['SQS_URL'],
      properties: {
        SQS_URL: { type: 'string' },
      },
    },
  },
});

// Auth?
// SDK?

const notify = async (msg) => {

};

module.exports = {
  notify,
};
