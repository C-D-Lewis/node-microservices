const AWS = require('aws-sdk');
const os = require('os');
const config = require('./config');

config.addPartialSchema({
  required: ['SES'],
  properties: {
    SES: {
      required: ['TO_ADDRESS', 'SENDER_ADDRESS', 'AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY'],
      properties: {
        TO_ADDRESS: { type: 'string' },
        SENDER_ADDRESS: { type: 'string' },
        AWS_ACCESS_KEY_ID: { type: 'string' },
        AWS_SECRET_ACCESS_KEY: { type: 'string' },
      },
    },
  },
});

const {
  SES: {
    TO_ADDRESS,
    SENDER_ADDRESS,
    AWS_ACCESS_KEY_ID,
    AWS_SECRET_ACCESS_KEY,
  },
} = config.get(['SES']);

const credentials = new AWS.Credentials({
  accessKeyId: AWS_ACCESS_KEY_ID,
  secretAccessKey: AWS_SECRET_ACCESS_KEY,
});

AWS.config.update({
  region: 'eu-west-2',
  credentials,
});

/** Subject for emails from node-microservices */
const SUBJECT = 'nms notification';

const sesApi = new AWS.SES({ apiVersion: '2010-12-01' });

/**
 * Send a notification email.
 *
 * @param {string} msg - Message content.
 * @param {string} extaSubject - Extra subject line.
 */
const notify = async (msg, extaSubject) => {
  const finalMsg = `--------------------------------
from: ${os.hostname()}
--------------------------------
${msg}
--------------------------------
`;

  const res = await sesApi.sendEmail({
    Source: SENDER_ADDRESS,
    Destination: { ToAddresses: [TO_ADDRESS] },
    Message: {
      Body: {
        Text: {
          Charset: 'UTF-8',
          Data: finalMsg,
        },
      },
      Subject: {
        Charset: 'UTF-8',
        Data: `${SUBJECT} ${extaSubject ? `- ${extaSubject}` : ''}`,
      },
    },
  }).promise();
  console.log(`ses: Sent email ${res.MessageId}`);
};

module.exports = {
  notify,
};
