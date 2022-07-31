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

const ses = new AWS.SES({ apiVersion: '2010-12-01' });

// Auth?
// SDK?

const notify = async (msg) => {

};

module.exports = {
  notify,
};
