const AWS = require('aws-sdk');
const os = require('os');
const config = require('./config');
const log = require('./log');

config.requireKeys('ses.js', {
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

const credentials = new AWS.Credentials({
  accessKeyId: config.SES.AWS_ACCESS_KEY_ID,
  secretAccessKey: config.SES.AWS_SECRET_ACCESS_KEY,
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
 */
const notify = async (msg) => {
  const finalMsg = `--------------------------------
from: ${os.hostname()}

${msg}
--------------------------------
`;

  const res = await sesApi.sendEmail({
    Source: config.SES.SENDER_ADDRESS,
    Destination: { ToAddresses: [config.SES.TO_ADDRESS] },
    Message: {
      Body: {
        Text: {
          Charset: 'UTF-8',
          Data: finalMsg,
        },
      },
      Subject: {
        Charset: 'UTF-8',
        Data: SUBJECT,
      },
    },
  }).promise();
  log.info(`ses: Sent email ${res.MessageId}`);
};

module.exports = {
  notify,
};
