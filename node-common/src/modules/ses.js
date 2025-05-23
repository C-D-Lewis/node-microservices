const AWS = require('aws-sdk');
const os = require('os');
const config = require('./config');

config.addPartialSchema({
  required: ['AWS', 'SES'],
  properties: {
    AWS: {
      required: [
        'ACCESS_KEY_ID',
        'SECRET_ACCESS_KEY',
      ],
      properties: {
        ACCESS_KEY_ID: { type: 'string' },
        SECRET_ACCESS_KEY: { type: 'string' },
      },
    },
    SES: {
      required: ['TO_ADDRESS', 'SENDER_ADDRESS'],
      properties: {
        TO_ADDRESS: { type: 'string' },
        SENDER_ADDRESS: { type: 'string' },
      },
    },
  },
});

const {
  SES: {
    TO_ADDRESS,
    SENDER_ADDRESS,
  },
  AWS: {
    ACCESS_KEY_ID,
    SECRET_ACCESS_KEY,
  },
} = config.get(['SES', 'AWS']);

const credentials = new AWS.Credentials({
  accessKeyId: ACCESS_KEY_ID,
  secretAccessKey: SECRET_ACCESS_KEY,
});

AWS.config.update({
  region: 'eu-west-2',
  credentials,
});

/** Subject for emails from node-microservices */
const SUBJECT = 'nms notification';

const sesApi = new AWS.SES({ apiVersion: '2010-12-01' });

/**
 * Make a more readable date time string.
 *
 * @returns {string} - Formatted date time string.
 */
const simlpeDateTime = () => {
  const date = new Date();
  return date.toISOString().replace('T', ' ').replace('Z', '');
};

/**
 * Send a notification email.
 *
 * @param {string} msg - Message content.
 * @param {string} extaSubject - Extra subject line.
 */
const notify = async (msg, extaSubject) => {
  const finalMsg = `${msg}


------------------------------------------------
${simlpeDateTime()} (${os.hostname()})
------------------------------------------------
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
